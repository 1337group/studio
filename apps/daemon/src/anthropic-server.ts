// @ts-nocheck
// MERGE-NOTE: studio — ShapeShifter addition. Server-side Anthropic SDK adapter.
//
// Open-design's default chat path is `child_process.spawn(<cli-bin>, ...)` —
// the daemon detects `claude`/`codex`/etc. on PATH and runs the user's local
// CLI. On Hive (172.16.1.77) we don't have those CLIs installed, so this
// adapter wires `@anthropic-ai/sdk` directly into the same SSE event shape
// the frontend already understands (`text_delta` / `usage` etc.).
//
// MVP key strategy: read `ANTHROPIC_API_KEY` from process.env. Per-user key
// resolution via auth-service `/me/api-keys` is deferred to P2.4.
//
// Adapted post upstream PR #118 (monorepo + JS→TS): operates on `run` +
// `design.runs` API rather than raw `res`, so it integrates with upstream's
// SSE multi-client + cancel + cleanup machinery.

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
 * claude-stream-json-shaped events via the `runs.emit(run, ...)` channel.
 *
 * @param {object} args
 * @param {object} args.def           Agent definition from agents.ts
 * @param {string} args.composed      The composed user message
 * @param {string|null} args.safeModel  Resolved model id, or null for env default
 * @param {object} args.run           design.runs run object
 * @param {object} args.runs          design.runs service (.emit / .finish)
 * @returns {Promise<void>}
 */
export async function streamServerSide({ def, composed, safeModel, run, runs }) {
  const send = (event, data) => runs.emit(run, event, data);

  const model =
    safeModel ||
    process.env.STUDIO_DEFAULT_MODEL ||
    'claude-sonnet-4-6';

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
    return runs.finish(run, 'failed', 1, null);
  }

  try {
    const stream = api.messages.stream({
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      messages: [{ role: 'user', content: composed }],
    });

    stream.on('text', (delta) => {
      if (run.cancelRequested) return;
      totalText += delta;
      send('agent', { type: 'text_delta', delta });
    });

    stream.on('error', (err) => {
      if (run.cancelRequested) return;
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

    if (!run.cancelRequested) {
      send('agent', {
        type: 'usage',
        usage,
        costUsd: null,
        durationMs: null,
        stopReason: finalMessage?.stop_reason ?? null,
      });
      runs.finish(run, 'succeeded', 0, null);
    } else {
      runs.finish(run, 'canceled', null, null);
    }
  } catch (err) {
    if (!run.cancelRequested) {
      send('error', { message: err && err.message ? err.message : String(err) });
      runs.finish(run, 'failed', 1, null);
    } else {
      runs.finish(run, 'canceled', null, null);
    }
  }
}
