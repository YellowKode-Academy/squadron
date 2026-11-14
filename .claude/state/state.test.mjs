// Tests for state.mjs. Run: node --test .claude/state/state.test.mjs
// Skips cleanly when node:sqlite is missing (Node < 22.13). Each run uses a temp folder.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tool = path.join(path.dirname(fileURLToPath(import.meta.url)), 'state.mjs');
let hasSqlite = true;
try { await import('node:sqlite'); } catch { hasSqlite = false; }
const skip = hasSqlite ? false : 'node:sqlite not available on this Node';

let dir;
before(() => { dir = mkdtempSync(path.join(tmpdir(), 'squadron-state-')); });
after(() => rmSync(dir, { recursive: true, force: true }));

const st = (...args) => {
  const r = spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8', env: { ...process.env, SQUADRON_STATE_DIR: dir } });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr };
};

test('lifecycle: add, start, done, block, list', { skip }, () => {
  assert.equal(st('init').code, 0);
  assert.equal(st('add', 'Write spec', '--agent', 'product-owner', '--spec', 'docs/a.md').out, '1');
  assert.equal(st('add', 'Build API', '--agent', 'backend-developer').out, '2');
  assert.equal(st('start', '1').code, 0);
  assert.match(st('list', '--status', 'doing').out, /Write spec/);
  assert.equal(st('done', '1', '--tool-calls', '12', '--tokens', '3400', '--model', 'sonnet').code, 0);
  assert.equal(st('block', '2', 'waits for contract').code, 0);
  const all = st('list').out;
  assert.match(all, /\| 1 \| done \| product-owner \| sonnet \| Write spec \| 12 \| 3400 \| docs\/a\.md \|/);
  assert.match(all, /blocked \(waits for contract\)/);
  assert.ok(!st('list', '--status', 'done').out.includes('Build API'));
});

test('report sums per agent and model', { skip }, () => {
  st('add', 'Another', '--agent', 'product-owner');
  st('start', '3');
  st('done', '3', '--tool-calls', '8', '--tokens', '600', '--model', 'sonnet');
  assert.match(st('report').out, /\| product-owner \| sonnet \| 2 \| 20 \| 4000 \|/);
});

test('export writes a readable STATE.md', { skip }, () => {
  assert.equal(st('export').code, 0);
  const file = path.join(dir, 'STATE.md');
  assert.ok(existsSync(file));
  const md = readFileSync(file, 'utf8');
  assert.match(md, /# Squadron state/);
  assert.match(md, /Build API/);
  assert.match(md, /## Per agent and model/);
});

test('bad input fails with a message, not a stack trace', { skip }, () => {
  assert.equal(st('start', '999').code, 1);
  assert.equal(st('start', 'abc').code, 1);
  assert.equal(st('done', '1', '--tokens', 'many').code, 1);
  assert.equal(st('block', '1').code, 1);
  assert.equal(st('list', '--status', 'weird').code, 1);
  assert.equal(st('nope').code, 1);
  assert.ok(!st('start', '999').err.includes('    at '));
});

test('without node:sqlite: one clear line and exit 1', { skip: hasSqlite ? 'node:sqlite is present on this Node' : false }, () => {
  const r = st('list');
  assert.equal(r.code, 1);
  assert.match(r.out, /needs Node >= .* with node:sqlite .*Markdown remains the source of truth/);
  assert.equal(r.out.split('\n').length, 1);
});
