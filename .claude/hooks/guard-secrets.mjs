// PreToolUse hook for Read, Edit, Write, Grep, Bash and PowerShell. Blocks:
//   - reading or editing secret files: .env and .env.* (not .env.example, .sample,
//     .template), *.pem, *.key, id_rsa*, .mcp.json (Write to .mcp.json is allowed)
//   - shell commands that print those files (cat, type, Get-Content, grep, ...)
//   - git commit when the added lines contain a secret or a .env file is staged.
//     With -a / --all / -am the working tree counts too (git diff HEAD).
// Lines containing `squadron:allow-secret` are ignored (test fixtures).
// Messages name the pattern and the file, never the secret value.
// Triggered by: node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-secrets.mjs"
import { block, readPayload, workDir, findGit, findSecret, tokens, segments, gitDir, git, ALLOW_MARKER } from './lib.mjs';

const payload = readPayload();
const tool = payload.tool_name;
const input = payload.tool_input;

function isSecretPath(p, { allowMcpWrite = false } = {}) {
  const base = String(p).split(/[\\/]/).pop().toLowerCase();
  if (/^\.env(\..+)?$/.test(base)) return !/^\.env\.(example|sample|template)$/.test(base);
  if (base.endsWith('.pem') || base.endsWith('.key') || base.startsWith('id_rsa')) return true;
  if (base === '.mcp.json') return !allowMcpWrite;
  return false;
}

if (tool === 'Read' || tool === 'Edit' || tool === 'Write') {
  if (typeof input.file_path !== 'string') block('Guard hook got no file_path. Blocking to be safe.');
  if (isSecretPath(input.file_path, { allowMcpWrite: tool === 'Write' })) {
    block('That file holds secrets and is off limits. Check by pattern search that it exists; never read or print its value. Use .env.example for the shape.');
  }
  process.exit(0);
}

if (tool === 'Grep') {
  if (typeof input.path === 'string' && isSecretPath(input.path)) {
    block('That file holds secrets and is off limits. Report that it exists, never its value.');
  }
  process.exit(0);
}

if (tool !== 'Bash' && tool !== 'PowerShell') process.exit(0);
const command = input.command;
if (typeof command !== 'string') block('Guard hook got no command string. Blocking to be safe.');

// Shell commands that print a secret file.
const READERS = new Set(['cat', 'type', 'less', 'more', 'head', 'tail', 'grep', 'rg', 'sed', 'awk', 'get-content', 'gc', 'select-string', 'sls', 'bat', 'strings', 'xxd', 'od', 'base64']);
for (const seg of segments(command)) {
  let t = tokens(seg);
  while (t.length && ['sudo', 'env', 'command'].includes(t[0].toLowerCase())) t = t.slice(1);
  if (!t.length || !READERS.has(t[0].toLowerCase())) continue;
  if (t.slice(1).some((x) => !x.startsWith('-') && isSecretPath(x))) {
    block('That command would print a secret file. Check by pattern search that the file exists; never show its value.');
  }
}

// git commit: scan what is about to be committed.
const cwd = workDir(payload);
const commits = findGit(command, 'commit');
// `git add . && git commit` stages after this hook runs, so the index is still empty now.
const chainedAdd = findGit(command, 'add').length > 0;
for (const c of commits) {
  const dir = gitDir(c.opts, cwd);
  const flags = tokens(c.rest).filter((x) => x.startsWith('-'));
  const all = chainedAdd || flags.some((f) => f === '--all' || /^-[A-Za-z]*a[A-Za-z]*$/.test(f));
  // commit -a (or a chained git add) stages at commit time, so --cached alone would be empty.
  // Scan staged + unstaged: `git diff HEAD`, or both diffs when there is no HEAD yet.
  const hasHead = git(dir, ['rev-parse', '--verify', '-q', 'HEAD']).ok;
  const views = !all ? [['diff', '--cached']] : hasHead ? [['diff', 'HEAD']] : [['diff', '--cached'], ['diff']];
  const names = views.flatMap((v) => git(dir, [...v, '--name-only']).out.split(/\r?\n/)).filter(Boolean);
  for (const f of names) {
    if (isSecretPath(f) && !/(^|[\\/])\.mcp\.json$/.test(f)) {
      block(`A secret file is part of this commit (${f}). Unstage it and keep it out of git.`);
    }
  }
  const added = views
    .map((v) => git(dir, [...v, '-U0']).out)
    .join('\n')
    .split(/\r?\n/)
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .join('\n');
  const hit = findSecret(added);
  if (hit) {
    block(`This commit adds what looks like a secret (${hit}). Remove it, rotate it if it was real, and use an environment variable. Add "${ALLOW_MARKER}" on the line only for test fixtures.`);
  }
}
// The commit command itself (the message) must not carry a secret either.
if (commits.length) {
  const hit = findSecret(command);
  if (hit) block(`The commit command contains what looks like a secret (${hit}). Remove it from the message.`);
}
process.exit(0);
