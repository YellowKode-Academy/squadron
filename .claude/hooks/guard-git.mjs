// PreToolUse hook for Bash and PowerShell. Blocks:
//   - git commit on main or master (also `git -C dir commit`, `a && git commit`)
//   - git push --force / -f / +refspec (--force-with-lease passes)
//   - recursive rm / Remove-Item aimed at /, ~, $HOME, ., .., * or outside the project
// Triggered by: node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-git.mjs"
import path from 'node:path';
import { block, readPayload, projectDir, workDir, findGit, tokens, segments, gitDir, git } from './lib.mjs';

const payload = readPayload();
const tool = payload.tool_name;
if (tool !== 'Bash' && tool !== 'PowerShell') process.exit(0);
const command = payload.tool_input.command;
if (typeof command !== 'string') block('Guard hook got no command string. Blocking to be safe.');

const cwd = workDir(payload);

// 1. Commit on main or master.
for (const c of findGit(command, 'commit')) {
  const r = git(gitDir(c.opts, cwd), ['symbolic-ref', '--short', 'HEAD']);
  if (r.ok && /^(main|master)$/.test(r.out.trim())) {
    block('Commit on main is blocked. Create a branch (`git switch -c <name>`), commit there.');
  }
}

// 2. Forced push.
for (const p of findGit(command, 'push')) {
  for (const t of tokens(p.rest)) {
    if (t === '--force' || /^-[A-Za-z]*f[A-Za-z]*$/.test(t) || /^\+\S/.test(t)) {
      block('Force push is blocked. Use `git push --force-with-lease` after the owner agrees, or fix the history another way.');
    }
  }
}

// 3. Recursive delete of something that is not clearly inside the project.
const RM_NAMES = new Set(['rm', 'remove-item', 'ri', 'del', 'erase', 'rd', 'rmdir']);
const PS_RECURSE = /^-r(e(c(u(r(s(e)?)?)?)?)?)?$/i;

function isRecursive(flags) {
  return flags.some((f) => PS_RECURSE.test(f) || f === '--recursive' || /^-[A-Za-z]*[rR][A-Za-z]*$/.test(f));
}

function toPosix(p) {
  let s = p.replace(/\\/g, '/');
  if (process.platform === 'win32') s = s.replace(/^\/([a-zA-Z])\//, '$1:/');
  return s;
}

function inside(child, parent) {
  const c = toPosix(path.resolve(child)).toLowerCase();
  const p = toPosix(path.resolve(parent)).toLowerCase().replace(/\/$/, '');
  return c === p || c.startsWith(`${p}/`);
}

function dangerous(target) {
  const p = target.replace(/^["']|["']$/g, '');
  if (/^(~|\$HOME|\$env:USERPROFILE|%USERPROFILE%)([\\/]\*?)?$/i.test(p)) return true;
  if (p === '*' || p === '/' || p === '/*') return true;
  if (/^\.{1,2}([\\/]\*?)?$/.test(p)) return true;
  const posix = toPosix(p);
  const absolute = posix.startsWith('/') || /^[a-zA-Z]:\//.test(posix);
  const resolved = absolute ? posix : path.resolve(cwd, p);
  return !inside(resolved, projectDir(payload));
}

for (const seg of segments(command)) {
  let t = tokens(seg);
  while (t.length && ['sudo', 'env', 'command'].includes(t[0].toLowerCase())) t = t.slice(1);
  if (!t.length || !RM_NAMES.has(t[0].toLowerCase())) continue;
  const rest = t.slice(1);
  const flags = rest.filter((x) => x.startsWith('-'));
  if (!isRecursive(flags)) continue;
  for (const target of rest.filter((x) => !x.startsWith('-'))) {
    if (dangerous(target)) {
      block('Recursive delete of that target is blocked: it is the root, the home folder, the project root, a wildcard, or outside the project. Name the exact folder inside the project.');
    }
  }
}
process.exit(0);
