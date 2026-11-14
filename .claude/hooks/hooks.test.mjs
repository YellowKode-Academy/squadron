// Tests for the guard hooks. Run: node --test .claude/hooks/hooks.test.mjs
// Each case spawns the hook like Claude Code does: JSON on stdin, exit code out.
// Needs Node >= 20 and git on PATH. No network. Fake secrets are built at run time
// so this file never contains one.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const FAKE_SK = 'sk-' + 'Ab1Cd2'.repeat(5);
const FAKE_GH = 'ghp_' + 'a1B2c3'.repeat(6);
const FAKE_AWS = 'AKIA' + 'ABCDEFGHIJKLMNOP';

let root;
let mainRepo; // on main
let featRepo; // on feature/x
let plainDir; // not a repository

function git(dir, ...args) {
  const r = spawnSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
}

function makeRepo(name, branch) {
  const dir = path.join(root, name);
  mkdirSync(dir);
  git(dir, 'init', '-q');
  git(dir, 'symbolic-ref', 'HEAD', `refs/heads/${branch}`);
  writeFileSync(path.join(dir, 'a.txt'), 'hello\n');
  git(dir, 'add', 'a.txt');
  git(dir, 'commit', '-q', '-m', 'init');
  return dir;
}

before(() => {
  root = realpathSync(mkdtempSync(path.join(tmpdir(), 'squadron-hooks-')));
  mainRepo = makeRepo('main-repo', 'main');
  featRepo = makeRepo('feat-repo', 'feature/x');
  plainDir = path.join(root, 'plain');
  mkdirSync(plainDir);
});

after(() => rmSync(root, { recursive: true, force: true }));

function run(script, payload, { cwd, raw, project, committers } = {}) {
  const input = raw !== undefined ? raw : JSON.stringify(payload);
  const env = { ...process.env, CLAUDE_PROJECT_DIR: project ?? cwd ?? root };
  // The session may set the allow list (settings.json env); tests choose it explicitly.
  delete env.SQUADRON_MAIN_COMMITTERS;
  if (committers !== undefined) env.SQUADRON_MAIN_COMMITTERS = committers;
  const r = spawnSync(process.execPath, [path.join(here, script)], { input, encoding: 'utf8', env, cwd: root });
  return { code: r.status, stderr: r.stderr };
}

const bash = (command, cwd, tool = 'Bash') => ({ tool_name: tool, cwd, tool_input: { command } });
const guardGit = (command, cwd, tool) => run('guard-git.mjs', bash(command, cwd, tool), { cwd });
const guardSecrets = (command, cwd, tool) => run('guard-secrets.mjs', bash(command, cwd, tool), { cwd });
const fileTool = (tool, file_path) => run('guard-secrets.mjs', { tool_name: tool, cwd: root, tool_input: { file_path } });

test('commit on main is blocked, in every spelling', () => {
  for (const cmd of [
    'git commit -m x',
    'git -C . commit -m x',
    'git -c user.name=a commit -m x',
    'git commit -am x',
    'git add . && git commit -m x',
    'git status; git commit -m x',
    'echo ok || git commit -m x',
  ]) {
    assert.equal(guardGit(cmd, mainRepo).code, 2, cmd);
  }
  assert.equal(guardGit('git commit -m x', mainRepo, 'PowerShell').code, 2);
});

test('git -C <dir> commit checks that directory, not the session directory', () => {
  assert.equal(guardGit(`git -C "${mainRepo}" commit -m x`, plainDir).code, 2);
  assert.equal(guardGit(`git -C "${featRepo}" commit -m x`, mainRepo).code, 0);
});

test('commit off main, outside a repository and unrelated commands pass', () => {
  assert.equal(guardGit('git commit -m x', featRepo).code, 0);
  assert.equal(guardGit('git -C . commit -m x', featRepo).code, 0);
  assert.equal(guardGit('git commit -am x', featRepo).code, 0);
  assert.equal(guardGit('git commit -m x', plainDir).code, 0);
  assert.equal(guardGit('git status && git log', mainRepo).code, 0);
  assert.equal(run('guard-git.mjs', { tool_name: 'Read', cwd: mainRepo, tool_input: { file_path: 'x' } }).code, 0);
});

test('force push is blocked, force-with-lease passes', () => {
  for (const cmd of [
    'git push --force',
    'git push origin main -f',
    'git push -f origin main',
    'git -C . push --force origin x',
    'git push origin +main',
    'git fetch && git push --force',
  ]) {
    assert.equal(guardGit(cmd, featRepo).code, 2, cmd);
  }
  assert.equal(guardGit('git push --force-with-lease', featRepo).code, 0);
  assert.equal(guardGit('git push origin feature/x', featRepo).code, 0);
});

test('commit on main passes only for a git user.name in SQUADRON_MAIN_COMMITTERS', () => {
  const ownerRepo = makeRepo('owner-repo', 'main');
  spawnSync('git', ['-C', ownerRepo, 'config', 'user.name', 'Owner Name']);
  const asOwner = (list) => run('guard-git.mjs', bash('git commit -m x', ownerRepo), { cwd: ownerRepo, committers: list });
  assert.equal(asOwner(undefined).code, 2, 'unset = nobody');
  assert.equal(asOwner('').code, 2, 'empty = nobody');
  assert.equal(asOwner('someone else').code, 2);
  assert.equal(asOwner('owner name').code, 0, 'case-insensitive');
  assert.equal(asOwner('x, Owner Name ,y').code, 0, 'comma list with spaces');
  // inherited env must not leak into a case that sets nothing
  const saved = process.env.SQUADRON_MAIN_COMMITTERS;
  process.env.SQUADRON_MAIN_COMMITTERS = 'Owner Name';
  try { assert.equal(asOwner(undefined).code, 2); } finally {
    if (saved === undefined) delete process.env.SQUADRON_MAIN_COMMITTERS; else process.env.SQUADRON_MAIN_COMMITTERS = saved;
  }
});

test('force push text inside quoted data is not a git call (G1)', () => {
  // String.raw: these are shell command lines, quotes and all.
  for (const cmd of [
    String.raw`node -e "run({command:'git push --force'})"`,
    String.raw`echo '{"command":"git push -f origin main"}' > case.json`,
    String.raw`echo "git push --force" > notes.txt`,
    "cat <<'EOF' > case.json\n{\"command\":\"git push -f origin main\"}\nEOF",
    String.raw`printf %s "git push origin +main" > case.txt`,
  ]) {
    assert.equal(guardGit(cmd, featRepo).code, 0, cmd);
  }
  assert.equal(guardGit('echo "git commit -m x" > case.txt', mainRepo).code, 0);
});

test('force push hidden inside a shell wrapper is still blocked', () => {
  for (const cmd of [
    'bash -c "git push --force"',
    "sh -c 'git push -f origin main'",
    'bash -lc "cd x && git push --force"',
    'eval "git push --force"',
    "eval 'git push origin +main'",
    'powershell -Command "git push --force"',
    'pwsh -c "git push -f"',
    'cmd /c "git push --force"',
    'cmd.exe /c git push --force',
    'echo "git push --force" | bash',
    'bash <<EOF\ngit push --force\nEOF',
    'echo "$(git push --force)"',
    String.raw`bash -c "bash -c \"git push -f\""`,
    'echo "unterminated git push --force',
  ]) {
    assert.equal(guardGit(cmd, featRepo).code, 2, cmd);
  }
  assert.equal(guardGit('bash -c "git commit -m x"', mainRepo).code, 2);
  assert.equal(guardGit('bash -c "git push --force-with-lease"', featRepo).code, 0);
});

test('recursive delete outside the project is blocked, inside passes', () => {
  for (const cmd of ['rm -rf /', 'rm -rf ~', 'rm -rf $HOME', 'rm -rf ..', 'rm -rf .', 'rm -rf *', 'rm -fr /tmp/other', 'sudo rm -rf /']) {
    assert.equal(guardGit(cmd, featRepo).code, 2, cmd);
  }
  assert.equal(guardGit('Remove-Item -Recurse -Force ..', featRepo, 'PowerShell').code, 2);
  assert.equal(guardGit('Remove-Item -Recurse -Force C:\\Windows', featRepo, 'PowerShell').code, 2);
  assert.equal(guardGit('bash -c "rm -rf /"', featRepo).code, 2);
  assert.equal(guardGit('rm -rf node_modules', featRepo).code, 0);
  assert.equal(guardGit('rm -rf dist', featRepo).code, 0);
  assert.equal(guardGit('rm -rf ./dist build', featRepo).code, 0);
  assert.equal(guardGit('rm file.txt', featRepo).code, 0);
  assert.equal(guardGit('Remove-Item -Recurse -Force dist', featRepo, 'PowerShell').code, 0);
});

test('reading secret files with the file tools', () => {
  for (const f of ['.env', '.env.local', '.env.production', 'server.pem', 'deploy.key', 'id_rsa', '.mcp.json']) {
    assert.equal(fileTool('Read', path.join(root, f)).code, 2, f);
  }
  assert.equal(fileTool('Read', path.join(root, '.env.example')).code, 0);
  assert.equal(fileTool('Read', path.join(root, '.env.sample')).code, 0);
  assert.equal(fileTool('Read', path.join(root, 'README.md')).code, 0);
  assert.equal(fileTool('Edit', path.join(root, '.env')).code, 2);
  assert.equal(fileTool('Write', path.join(root, '.env')).code, 2);
  assert.equal(fileTool('Write', path.join(root, '.mcp.json')).code, 0);
  assert.equal(fileTool('Read', 'C:\\proj\\.env').code, 2);
});

test('printing secret files from the shell', () => {
  assert.equal(guardSecrets('cat .env', featRepo).code, 2);
  assert.equal(guardSecrets('cat .env.local | head', featRepo).code, 2);
  assert.equal(guardSecrets('Get-Content .env', featRepo, 'PowerShell').code, 2);
  assert.equal(guardSecrets('type .env.production', featRepo, 'PowerShell').code, 2);
  assert.equal(guardSecrets('grep -n KEY server.pem', featRepo).code, 2);
  assert.equal(guardSecrets('cat .env.example', featRepo).code, 0);
  assert.equal(guardSecrets('cat README.md', featRepo).code, 0);
});

test('commit with a secret in a staged file is blocked, and the message hides the key', () => {
  writeFileSync(path.join(featRepo, 's1.js'), `const k = "${FAKE_SK}";\n`);
  git(featRepo, 'add', 's1.js');
  const r = guardSecrets('git commit -m x', featRepo);
  assert.equal(r.code, 2);
  assert.ok(!r.stderr.includes(FAKE_SK), 'stderr must not echo the secret');
  assert.match(r.stderr, /OpenAI-style/);
  git(featRepo, 'reset', '-q', 's1.js');
  rmSync(path.join(featRepo, 's1.js'));
});

test('commit -a / -am sees a secret that is only in the working tree', () => {
  writeFileSync(path.join(featRepo, 'a.txt'), `hello\nkey=${FAKE_GH}\n`);
  for (const cmd of ['git commit -a -m x', 'git commit -am x', 'git commit --all -m x', 'git add -A && git commit -m x']) {
    const r = guardSecrets(cmd, featRepo);
    assert.equal(r.code, 2, cmd);
    assert.ok(!r.stderr.includes(FAKE_GH));
  }
  // Without -a the unstaged change is not part of the commit.
  assert.equal(guardSecrets('git commit -m x', featRepo).code, 0);
  writeFileSync(path.join(featRepo, 'a.txt'), `hello\nkey=${FAKE_GH} # squadron:allow-secret\n`);
  assert.equal(guardSecrets('git commit -am x', featRepo).code, 0);
  git(featRepo, 'checkout', '--', 'a.txt');
});

test('other secret shapes and a staged .env are blocked', () => {
  writeFileSync(path.join(featRepo, 's2.txt'), `${FAKE_AWS}\n`);
  git(featRepo, 'add', 's2.txt');
  assert.equal(guardSecrets('git commit -m x', featRepo).code, 2);
  git(featRepo, 'reset', '-q', 's2.txt');
  rmSync(path.join(featRepo, 's2.txt'));
  writeFileSync(path.join(featRepo, '.env'), 'A=1\n');
  git(featRepo, 'add', '-f', '.env');
  assert.equal(guardSecrets('git commit -m x', featRepo).code, 2);
  git(featRepo, 'rm', '-q', '--cached', '.env');
  rmSync(path.join(featRepo, '.env'));
  assert.equal(guardSecrets('git commit -m x', featRepo).code, 0);
});

test('a secret typed into the commit message is blocked', () => {
  assert.equal(guardSecrets(`git commit -m "token ${FAKE_SK}"`, featRepo).code, 2);
});

test('fail closed: bad input blocks, a BOM does not', () => {
  const ok = JSON.stringify(bash('git status', featRepo));
  assert.equal(run('guard-git.mjs', null, { raw: '\ufeff' + ok, cwd: featRepo }).code, 0);
  for (const script of ['guard-git.mjs', 'guard-secrets.mjs', 'scan-prompt.mjs']) {
    assert.equal(run(script, null, { raw: '{not json' }).code, 2, `${script} invalid JSON`);
    assert.equal(run(script, null, { raw: '' }).code, 2, `${script} empty input`);
    assert.equal(run(script, null, { raw: '[]' }).code, 2, `${script} not an object`);
  }
  assert.equal(run('guard-git.mjs', { tool_name: 'Bash' }).code, 2, 'missing tool_input');
  assert.equal(run('guard-secrets.mjs', { tool_name: 'Bash', tool_input: {} }).code, 2, 'missing command');
  assert.equal(run('guard-secrets.mjs', { tool_name: 'Read', tool_input: {} }).code, 2, 'missing file_path');
});

test('the runtime is real: node runs and git answers', () => {
  // On Windows a command can exist as a stub that does not run (python3 from the
  // Microsoft Store is the known case). Run both for real instead of looking them up.
  const n = spawnSync(process.execPath, ['--version'], { encoding: 'utf8' });
  assert.equal(n.status, 0);
  assert.match(n.stdout, /^v(\d+)\./);
  assert.ok(Number(n.stdout.match(/^v(\d+)/)[1]) >= 20, 'Node >= 20 required');
  const g = spawnSync('git', ['--version'], { encoding: 'utf8' });
  assert.equal(g.status, 0);
});

test('prompt scan', () => {
  assert.equal(run('scan-prompt.mjs', { prompt: `use ${FAKE_GH} to log in` }).code, 2);
  const r = run('scan-prompt.mjs', { prompt: `use ${FAKE_SK}` });
  assert.equal(r.code, 2);
  assert.ok(!r.stderr.includes(FAKE_SK));
  assert.equal(run('scan-prompt.mjs', { prompt: 'build the login screen' }).code, 0);
  assert.equal(run('scan-prompt.mjs', { hook_event_name: 'UserPromptSubmit' }).code, 2, 'no prompt field');
});
