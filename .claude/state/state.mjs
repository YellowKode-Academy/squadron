#!/usr/bin/env node
// Squadron state tool. EXPERIMENTAL and optional. Nothing else in the repo depends on it.
//
// What it is for: Markdown stays the place for MEANING (specs, briefs, decisions).
// State that changes often lives here instead: tasks, owner agent, status, model,
// tool calls, tokens, timestamps. One local SQLite file, no packages.
//
// Needs the built-in `node:sqlite`: Node >= 22.13 (22.5 to 22.12 needs
// --experimental-sqlite; Node 20 does not have it at all). The hooks do NOT use it
// and keep working on Node 20. Without it this tool prints one line and exits 1.
// Markdown remains the source of truth: `export` writes STATE.md for anyone
// (human or agent) who cannot or does not want to run the tool.
//
// How to tell whether it helped: run one cycle with it and one without, and compare
//   1. time spent re-finding state at the start of a session ("where were we?"),
//   2. size of the handoff text between agents or sessions,
//   3. cost visibility: can you say which agent/model spent the tokens and tool calls?
// If none of the three moved, delete .claude/state/ and go back to Markdown only.
//
// Usage: node .claude/state/state.mjs <command>
//   init
//   add "<title>" [--agent x] [--spec path]
//   start <id>
//   done <id> [--tool-calls n] [--tokens n] [--model m]
//   block <id> "<reason>"
//   list [--status todo|doing|done|blocked]
//   report            per agent and model: tasks, tool calls, tokens
//   export            writes .claude/state/STATE.md
// Env (tests): SQUADRON_STATE_DIR overrides the folder holding squadron.db and STATE.md.
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MIN_NODE = '22.13';
let DatabaseSync;
try {
  ({ DatabaseSync } = await import('node:sqlite'));
  if (typeof DatabaseSync !== 'function') throw new Error('no DatabaseSync');
} catch {
  console.log(`state.mjs needs Node >= ${MIN_NODE} with node:sqlite (this is ${process.version}); Markdown remains the source of truth.`);
  process.exit(1);
}

const dir = process.env.SQUADRON_STATE_DIR || path.dirname(fileURLToPath(import.meta.url));
mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, 'squadron.db'));
db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  agent TEXT,
  spec TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done','blocked')),
  model TEXT,
  tool_calls INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  blocked_reason TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  done_at TEXT,
  updated_at TEXT NOT NULL
);`);

const now = () => new Date().toISOString();

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// Splits argv into positionals and --flags (each flag takes one value).
function parse(args) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (i + 1 >= args.length) fail(`${args[i]} needs a value`);
      flags[args[i].slice(2)] = args[++i];
    } else pos.push(args[i]);
  }
  return { pos, flags };
}

function num(v, name) {
  if (v === undefined) return undefined;
  if (!/^\d+$/.test(v)) fail(`${name} must be a non-negative integer`);
  return Number(v);
}

function task(idText) {
  if (!/^\d+$/.test(String(idText))) fail('task id must be a number');
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(idText));
  if (!t) fail(`no task with id ${idText}`);
  return t;
}

const cell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ');

function table(rows) {
  const head = '| id | status | agent | model | title | tool calls | tokens | spec |\n|---|---|---|---|---|---|---|---|';
  return `${head}\n${rows.map((r) => `| ${r.id} | ${r.status}${r.blocked_reason ? ` (${cell(r.blocked_reason)})` : ''} | ${cell(r.agent)} | ${cell(r.model)} | ${cell(r.title)} | ${r.tool_calls} | ${r.tokens} | ${cell(r.spec)} |`).join('\n')}`;
}

function reportText() {
  const rows = db.prepare(`SELECT COALESCE(agent,'-') AS agent, COALESCE(model,'-') AS model, COUNT(*) AS tasks,
    SUM(tool_calls) AS tool_calls, SUM(tokens) AS tokens FROM tasks GROUP BY 1, 2 ORDER BY 1, 2`).all();
  if (!rows.length) return 'No tasks yet.';
  return `| agent | model | tasks | tool calls | tokens |\n|---|---|---|---|---|\n${rows.map((r) => `| ${cell(r.agent)} | ${cell(r.model)} | ${r.tasks} | ${r.tool_calls} | ${r.tokens} |`).join('\n')}`;
}

const [cmd, ...rest] = process.argv.slice(2);
const { pos, flags } = parse(rest);

switch (cmd) {
  case 'init':
    console.log(`ok: ${path.join(dir, 'squadron.db')}`);
    break;
  case 'add': {
    if (!pos[0]) fail('usage: add "<title>" [--agent x] [--spec path]');
    const t = now();
    const r = db.prepare('INSERT INTO tasks (title, agent, spec, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(pos[0], flags.agent ?? null, flags.spec ?? null, t, t);
    console.log(Number(r.lastInsertRowid));
    break;
  }
  case 'start': {
    const t = task(pos[0]);
    db.prepare("UPDATE tasks SET status = 'doing', started_at = COALESCE(started_at, ?), blocked_reason = NULL, updated_at = ? WHERE id = ?")
      .run(now(), now(), t.id);
    console.log(`task ${t.id}: doing`);
    break;
  }
  case 'done': {
    const t = task(pos[0]);
    const calls = num(flags['tool-calls'], '--tool-calls');
    const tokens = num(flags.tokens, '--tokens');
    db.prepare("UPDATE tasks SET status = 'done', done_at = ?, blocked_reason = NULL, tool_calls = ?, tokens = ?, model = ?, updated_at = ? WHERE id = ?")
      .run(now(), calls ?? t.tool_calls, tokens ?? t.tokens, flags.model ?? t.model, now(), t.id);
    console.log(`task ${t.id}: done`);
    break;
  }
  case 'block': {
    const t = task(pos[0]);
    if (!pos[1]) fail('usage: block <id> "<reason>"');
    db.prepare("UPDATE tasks SET status = 'blocked', blocked_reason = ?, updated_at = ? WHERE id = ?").run(pos[1], now(), t.id);
    console.log(`task ${t.id}: blocked`);
    break;
  }
  case 'list': {
    if (flags.status && !['todo', 'doing', 'done', 'blocked'].includes(flags.status)) fail('--status must be todo, doing, done or blocked');
    const rows = flags.status
      ? db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY id').all(flags.status)
      : db.prepare('SELECT * FROM tasks ORDER BY id').all();
    console.log(rows.length ? table(rows) : 'No tasks.');
    break;
  }
  case 'report':
    console.log(reportText());
    break;
  case 'export': {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY id').all();
    const md = `# Squadron state\n\nGenerated by .claude/state/state.mjs at ${now()}. Do not edit: run \`export\` again.\nMeaning (specs, briefs, decisions) lives in the Markdown files; this is only the changing state.\n\n## Tasks\n\n${rows.length ? table(rows) : 'No tasks.'}\n\n## Per agent and model\n\n${reportText()}\n`;
    const file = path.join(dir, 'STATE.md');
    writeFileSync(file, md);
    console.log(`wrote ${file}`);
    break;
  }
  default:
    fail('usage: state.mjs init | add "<title>" [--agent x] [--spec path] | start <id> | done <id> [--tool-calls n] [--tokens n] [--model m] | block <id> "<reason>" | list [--status s] | report | export');
}
