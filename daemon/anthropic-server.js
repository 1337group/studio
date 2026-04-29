// MERGE-NOTE: studio — ShapeShifter addition. Server-side Anthropic SDK adapter.
//
// Open-design's default chat path is `child_process.spawn(<cli-bin>, ...)` —
// the daemon detects `claude`/`codex`/etc. on PATH and runs the user's local
// CLI. On Hive (172.16.1.77) we don't have those CLIs installed, so this
// adapter wires `@anthropic-ai/sdk` directly into the same SSE event shape
// the frontend already understands (`text_delta` / `tool_use` /
// `tool_result` / `usage` etc., parsed by `src/runtime/sse.ts`).
//
// MVP key strategy: read `ANTHROPIC_API_KEY` from process.env. Per-user key
// resolution via auth-service `/me/api-keys` is deferred to P2.4.
//
// Streaming events: we use the SDK's `client.messages.stream()` and emit
// `text_delta` (and a final `usage` event) shaped like the Claude Code CLI's
// stream-json events. The frontend parser doesn't care which agent produced
// them — it just consumes the typed stream.

import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MAX_TOKENS = 8192;

let cachedClient = null;
function client() {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set on Studio daemon');
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export function isServerSideAgent(def) {
  return def && def.bin === null && def.streamFormat === 'sdk-direct';
}

/**
 * Stream a single user turn through the Anthropic SDK and emit
 * claude-stream-json-shaped events via the supplied `send(event, data)`
 * helper. Mirrors the contract of `daemon/server.js`'s spawn path so the
 * frontend can't tell which agent produced the events.
 *
 * @param {object} args
 * @param {object} args.def           Agent definition from agents.js
 * @param {string} args.composed      The composed user message (system + cwd
 *                                    + attachments + user request)
 * @param {string|null} args.safeModel  Resolved model id, or null for env default
 * @param {(event:string,data:object)=>void} args.send  SSE emitter
 * @param {object} args.res            Express response (so we can detect aborts)
 * @returns {Promise<void>} resolves when the stream completes (success or error)
 */
export async function streamServerSide({ def, composed, safeModel, send, res }) {
  let aborted = false;
  res.on('close', () => {
    aborted = true;
  });

  const model =
    safeModel ||
    process.env.STUDIO_DEFAULT_MODEL ||
    'claude-sonnet-latest';

  send('start', {
    agentId: def.id,
    bin: null,
    streamFormat: 'claude-stream-json',
    model,
    reasoning: null,
  });

  let totalText = '';
  let usage = null;

  let api;
  try {
    api = client();
  } catch (err) {
    send('error', { message: err && err.message ? err.message : String(err) });
    return res.end();
  }

  try {
    const stream = api.messages.stream({
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      messages: [{ role: 'user', content: composed }],
    });

    stream.on('text', (delta) => {
      if (aborted) return;
      totalText += delta;
      // Emit in the same envelope the Claude Code CLI's stream-json parser
      // produces, so the frontend never has to special-case server-side.
      send('agent', { type: 'text_delta', delta });
    });

    stream.on('error', (err) => {
      if (aborted) return;
      send('error', { message: err && err.message ? err.message : String(err) });
    });

    const finalMessage = await stream.finalMessage();

    if (finalMessage && finalMessage.usage) {
      usage = {
        input_tokens: finalMessage.usage.input_tokens ?? null,
        output_tokens: finalMessage.usage.output_tokens ?? null,
        cache_creation_input_tokens:
          finalMessage.usage.cache_creation_input_tokens ?? null,
        cache_read_input_tokens:
          finalMessage.usage.cache_read_input_tokens ?? null,
      };
    }

    if (!aborted) {
      send('agent', {
        type: 'usage',
        usage,
        costUsd: null,
        durationMs: null,
        stopReason: finalMessage?.stop_reason ?? null,
      });
      send('end', { code: 0, signal: null });
    }
  } catch (err) {
    if (!aborted) {
      send('error', { message: err && err.message ? err.message : String(err) });
      send('end', { code: 1, signal: null });
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
}
