// UserPromptSubmit hook. Blocks a prompt that contains what looks like a secret,
// so it never reaches the model or the transcript as a pasted key.
// Triggered by: node "${CLAUDE_PROJECT_DIR}/.claude/hooks/scan-prompt.mjs"
import { block, readPayload, findSecret } from './lib.mjs';

const payload = readPayload({ needToolInput: false });
if (typeof payload.prompt !== 'string') block('Guard hook got no prompt text. Blocking to be safe.');
const hit = findSecret(payload.prompt);
if (hit) {
  block(`Your prompt contains what looks like a secret (${hit}). Remove it and refer to an environment variable instead.`);
}
process.exit(0);
