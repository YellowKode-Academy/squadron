// Shared helpers for the squadron guard hooks. Node >= 20, no dependencies.
// Contract: read the hook payload from stdin. Fail closed: if the payload cannot
// be parsed (or has no tool_input when one is required), block with exit 2.
// Exit 2 is the only code Claude Code treats as "block". Any other failure code
// lets the action through, so every error path here ends in block().
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

export function readPayload({ needToolInput = true } = {}) {
  let raw;
  try {
    raw = readFileSync(0, 'utf8');
  } catch (err) {
    block(`Guard hook could not read its input (${err.code || 'error'}). Blocking to be safe.`);
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    block('Guard hook got input that is not valid JSON. Blocking to be safe.');
  }
  if (payload === null || typeof payload !== 'object') {
    block('Guard hook got input that is not a JSON object. Blocking to be safe.');
  }
  if (needToolInput && (payload.tool_input === null || typeof payload.tool_input !== 'object')) {
    block('Guard hook got no tool_input. Blocking to be safe.');
  }
  return payload;
}

export function projectDir(payload) {
  return process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
}

// Directory where git commands should run: where the session is, else the project.
export function workDir(payload) {
  return payload.cwd || projectDir(payload);
}

export const SECRET_PATTERNS = [
  { name: 'OpenAI-style key (sk-)', re: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: 'GitHub token', re: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: 'AWS access key id', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Slack token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

export const ALLOW_MARKER = 'squadron:allow-secret';

// Returns the name of the first pattern found in text, or null. Never the value.
export function findSecret(text) {
  for (const line of String(text).split(/\r?\n/)) {
    if (line.includes(ALLOW_MARKER)) continue;
    for (const p of SECRET_PATTERNS) if (p.re.test(line)) return p.name;
  }
  return null;
}

const ARG = String.raw`(?:"[^"]*"|'[^']*'|\S+)`;
// Options allowed between `git` and the subcommand: -C dir, -c k=v, --long[=v].
const GIT_OPTS = String.raw`(?:\s+(?:-[Cc]\s+${ARG}|--[\w-]+(?:=\S+)?|-[pP]))*`;
const SEPARATOR = /&&|\|\||[;|\n]/;

// Words that run their quoted argument as a command: `bash -c "..."`, `eval "..."`,
// `powershell -Command "..."`, `cmd /c "..."`, `ssh host "..."`. Text after one of these
// (or before a pipe into one) is inspected as a command; any other quoted text is plain data.
const SHELL_WORDS = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'fish', 'csh', 'tcsh', 'eval', 'powershell', 'pwsh',
  'cmd', 'iex', 'invoke-expression', 'start-process', 'ssh', 'su', 'wsl', 'xargs', 'nohup']);
const SHELL_SINK = /\|\s*(?:\S*[\\/])?(?:bash|sh|zsh|dash|ksh|fish|powershell|pwsh|cmd)(?:\.exe)?\b/i;

function hasShellWord(before) {
  const seg = before.split(SEPARATOR).pop();
  return seg.split(/\s+/).some((w) => SHELL_WORDS.has(w.replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase()));
}

// Finds quoted strings and heredoc bodies in a command line. Returns
// [{ start, end, text, dq }] where start/end bound the CONTENT (without the quotes).
// An unterminated quote is not a span: its text stays visible to the checks (fail closed).
function quotedSpans(cmd) {
  const spans = [];
  let pending = null;
  let i = 0;
  while (i < cmd.length) {
    const c = cmd[i];
    if (c === '\n' && pending) {
      spans.push({ start: pending.start, end: pending.end, text: cmd.slice(pending.start, pending.end), dq: false, ref: pending.op });
      i = pending.end;
      pending = null;
      continue;
    }
    if (c === '\\' && (cmd[i + 1] === '"' || cmd[i + 1] === "'" || cmd[i + 1] === '\\')) { i += 2; continue; }
    if (c === '<' && cmd[i + 1] === '<' && cmd[i + 2] !== '<' && !pending) {
      const h = /^<<-?[ \t]*(['"]?)([A-Za-z_]\w*)\1/.exec(cmd.slice(i));
      if (h) {
        const nl = cmd.indexOf('\n', i);
        if (nl !== -1) {
          const bodyStart = nl + 1;
          const close = new RegExp(`^[ \\t]*${h[2]}[ \\t]*$`, 'm').exec(cmd.slice(bodyStart));
          pending = { op: i, start: bodyStart, end: close ? bodyStart + close.index : cmd.length };
        }
        i += h[0].length;
        continue;
      }
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let closed = -1;
      while (j < cmd.length) {
        if (c === '"' && cmd[j] === '\\' && (cmd[j + 1] === '"' || cmd[j + 1] === '\\')) { j += 2; continue; }
        if (c === '"' && cmd[j] === '`' && cmd[j + 1] === '"') { j += 2; continue; }
        if (cmd[j] === c) { closed = j; break; }
        j++;
      }
      if (closed === -1) { i++; continue; }
      let text = cmd.slice(i + 1, closed);
      if (c === '"') text = text.replace(/\\(["\\])/g, '$1');
      spans.push({ start: i + 1, end: closed, text, dq: c === '"', ref: i });
      i = closed + 1;
      continue;
    }
    i++;
  }
  return spans;
}

// Command texts hidden inside quotes that DO run: the argument of bash -c / eval /
// powershell -Command / cmd /c ..., text piped into a shell, and $(...) or backtick
// substitutions inside double quotes. Recursive, depth-limited. Plain quoted data is not returned.
export function innerCommands(command, depth = 0) {
  if (depth > 4) return [];
  const out = [];
  const sink = SHELL_SINK.test(command);
  for (const sp of quotedSpans(command)) {
    if (sink || hasShellWord(command.slice(0, sp.ref))) out.push(sp.text);
    else if (sp.dq) {
      for (const m of sp.text.matchAll(/\$\(([^)]*)\)|`([^`]*)`/g)) out.push(m[1] ?? m[2]);
    }
  }
  return out.flatMap((t) => [t, ...innerCommands(t, depth + 1)]);
}

// Finds every `git [opts] <sub>` in a command line, chained or not, outside quoted data.
// Returns [{ opts, rest }]: opts is the text between git and sub, rest is what
// follows up to the next command separator. A match inside quotes counts only when
// the quotes belong to a shell wrapper (see innerCommands).
export function findGit(command, sub) {
  const found = [];
  for (const text of [command, ...innerCommands(command)]) {
    const spans = quotedSpans(text);
    const re = new RegExp(String.raw`\bgit(${GIT_OPTS})\s+${sub}\b`, 'g');
    for (const m of text.matchAll(re)) {
      if (spans.some((sp) => m.index >= sp.start && m.index < sp.end)) continue;
      const after = text.slice(m.index + m[0].length);
      const cut = after.search(SEPARATOR);
      found.push({ opts: m[1] || '', rest: cut === -1 ? after : after.slice(0, cut) });
    }
  }
  return found;
}

export function tokens(text) {
  const out = [];
  for (const m of text.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

export function segments(command) {
  return command.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
}

// Directory a git command acts on: its -C argument if any, else the session dir.
export function gitDir(opts, cwd) {
  const m = opts.match(new RegExp(String.raw`-C\s+(${ARG})`));
  if (!m) return cwd;
  const dir = m[1].replace(/^["']|["']$/g, '');
  return path.resolve(cwd, dir);
}

export function git(dir, args) {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: r.stdout || '', err: r.stderr || '' };
}
