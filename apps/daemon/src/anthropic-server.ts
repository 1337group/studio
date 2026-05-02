// @ts-nocheck
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
// Attachment handling (locked 2026-05-02 after users reported attachments
// not coming through). Two upstream sources:
//   1. `safeImages` — chat paperclip uploads under UPLOAD_DIR (absolute paths).
//   2. `safeAttachments` — project-relative paths inside `cwd` (Design Files).
// CLI agents like `claude` walk the project folder and resolve `@<path>`
// tokens themselves; the SDK can't. So we read each file server-side and
// build proper Anthropic content blocks: image/* → base64 image block,
// text/code → inline as a fenced code block in the prompt. Anything that
// fails to read or exceeds size caps is reported back to the user.
//
// Streaming events: we use the SDK's `client.messages.stream()` and emit
// `text_delta` (and a final `usage` event) shaped like the Claude Code CLI's
// stream-json events. The frontend parser doesn't care which agent produced
// them — it just consumes the typed stream.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, statSync } from 'node:fs';
import { extname, resolve as pathResolve, basename } from 'node:path';
import baseLogger from './logger.js';

const log = baseLogger.child({ component: 'anthropic-server' });

// MERGE-NOTE: studio — was 8192 (upstream default for CLI agents), but
// Studio's primary output is full HTML artifacts that easily exceed that cap
// — Dunsire homepage hit the limit mid-CSS at ~19KB on disk, triggering the
// "artifact got cut off" loop users complained about. Claude 4 supports 64K
// output tokens; we default to 32K (safe across all Claude 4 models, leaves
// room for thinking/usage events). Override via STUDIO_MAX_TOKENS env.
const DEFAULT_MAX_TOKENS = (() => {
  const env = Number.parseInt(process.env.STUDIO_MAX_TOKENS ?? '', 10);
  if (Number.isFinite(env) && env >= 1024 && env <= 65536) return env;
  return 32768;
})();
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;          // Anthropic vision per-image cap
const MAX_IMAGES_PER_REQUEST = 20;                 // safety cap; Anthropic allows up to 100
const MAX_TEXT_INLINE_BYTES = 256 * 1024;          // 256KB per text attachment inlined into prompt
const MAX_TEXT_ATTACHMENTS = 10;                   // safety cap on inlined text files

const IMAGE_MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

// Extensions we'll inline as text. Project Design Files are mostly source
// artifacts (HTML, CSS, JS, TSX, MD, JSON). Anything else gets a "skipped"
// note instead of being silently dropped or binary-inlined.
const TEXT_INLINE_EXTS = new Set([
  '.html', '.htm', '.css', '.scss', '.less',
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.json', '.jsonl', '.yaml', '.yml', '.toml',
  '.md', '.mdx', '.txt', '.log',
  '.svg', // SVG is text; let the model read the source
  '.xml', '.csv', '.tsv',
  '.sql', '.sh', '.bash', '.zsh',
  '.py', '.rb', '.go', '.rs', '.java', '.swift', '.kt', '.c', '.cpp', '.h',
]);

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

// Resolve an attachment path. `safeImages` arrive absolute (UPLOAD_DIR);
// `safeAttachments` are project-relative and need to be resolved against cwd.
function resolveAttachment(p, { isProjectRelative, cwd }) {
  if (!isProjectRelative) return p;
  if (!cwd) return null;
  return pathResolve(cwd, p);
}

// Walk a list of paths; classify each as image | text | skipped. Returns
// { imageBlocks, textInlines, skipped }.
function classifyAttachments(paths, { isProjectRelative, cwd }) {
  const imageBlocks = [];
  const textInlines = [];
  const skipped = [];
  if (!Array.isArray(paths) || paths.length === 0) {
    return { imageBlocks, textInlines, skipped };
  }
  let textCount = 0;
  for (const rawPath of paths) {
    const resolved = resolveAttachment(rawPath, { isProjectRelative, cwd });
    if (!resolved) {
      skipped.push({ path: rawPath, reason: 'cwd missing for project-relative path' });
      continue;
    }
    try {
      const ext = extname(resolved).toLowerCase();
      const mime = IMAGE_MIME_BY_EXT[ext];
      const stat = statSync(resolved);

      if (mime) {
        if (imageBlocks.length >= MAX_IMAGES_PER_REQUEST) {
          skipped.push({ path: rawPath, reason: `image cap of ${MAX_IMAGES_PER_REQUEST} reached` });
          continue;
        }
        if (stat.size > MAX_IMAGE_BYTES) {
          skipped.push({ path: rawPath, reason: `image over ${MAX_IMAGE_BYTES}B (${stat.size}B)` });
          continue;
        }
        const data = readFileSync(resolved).toString('base64');
        imageBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: mime, data },
        });
        continue;
      }

      if (TEXT_INLINE_EXTS.has(ext)) {
        if (textCount >= MAX_TEXT_ATTACHMENTS) {
          skipped.push({ path: rawPath, reason: `text inline cap of ${MAX_TEXT_ATTACHMENTS} reached` });
          continue;
        }
        if (stat.size > MAX_TEXT_INLINE_BYTES) {
          skipped.push({ path: rawPath, reason: `text over ${MAX_TEXT_INLINE_BYTES}B (${stat.size}B)` });
          continue;
        }
        const text = readFileSync(resolved, 'utf8');
        textInlines.push({ name: basename(resolved), ext, text });
        textCount += 1;
        continue;
      }

      skipped.push({ path: rawPath, reason: `unsupported ext ${ext || '<none>'}` });
    } catch (err) {
      skipped.push({ path: rawPath, reason: String(err && err.message ? err.message : err) });
    }
  }
  return { imageBlocks, textInlines, skipped };
}

function renderTextInlines(textInlines) {
  if (textInlines.length === 0) return '';
  const parts = ['\n\n--- Attached files (inlined for the agent) ---'];
  for (const { name, ext, text } of textInlines) {
    const lang = ext.replace(/^\./, '');
    parts.push(`\n\n<file name="${name}">`);
    parts.push('```' + lang);
    parts.push(text);
    parts.push('```');
    parts.push('</file>');
  }
  return parts.join('\n');
}

/**
 * Stream a single user turn through the Anthropic SDK and emit
 * claude-stream-json-shaped events via design.runs.emit. Mirrors the
 * contract of `daemon/server.ts`'s spawn path so the frontend can't tell
 * which agent produced the events.
 *
 * @param {object} args
 * @param {object} args.def           Agent definition from agents.ts
 * @param {string} args.composed      Composed user message (system + cwd + user request)
 * @param {string|null} args.safeModel  Resolved model id, or null for env default
 * @param {string[]} [args.safeImages]      Absolute paths under UPLOAD_DIR (paperclip uploads)
 * @param {string[]} [args.safeAttachments] Project-relative paths inside cwd (Design Files)
 * @param {string|null} [args.cwd]    Project working directory (for resolving safeAttachments)
 * @param {object} args.run           Run record from design.runs
 * @param {object} args.runs          design.runs service (emit/finish/fail)
 * @returns {Promise<void>} resolves when the stream completes (success or error)
 */
export async function streamServerSide({
  def,
  composed,
  safeModel,
  safeImages,
  safeAttachments,
  cwd,
  run,
  runs,
}) {
  // Bridge to the SSE emitter API the rest of the daemon uses.
  const send = (event, data) => runs.emit(run, event, data);
  const isAborted = () =>
    Boolean(run && (run.cancelRequested || (runs.isTerminal && runs.isTerminal(run.status))));

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

  // Classify both attachment sources.
  const upload = classifyAttachments(safeImages, { isProjectRelative: false, cwd: null });
  const project = classifyAttachments(safeAttachments, { isProjectRelative: true, cwd });

  const imageBlocks = [...upload.imageBlocks, ...project.imageBlocks];
  const textInlines = [...upload.textInlines, ...project.textInlines];
  const skipped = [...upload.skipped, ...project.skipped];

  if (skipped.length > 0) {
    const note = `\n\n[Studio: ${skipped.length} attachment(s) skipped — ${skipped.map(s => `${s.path} (${s.reason})`).join('; ')}]`;
    send('agent', { type: 'text_delta', delta: note });
  }

  const promptText = composed + renderTextInlines(textInlines);

  // Anthropic content array: text first, then images. The CLI's `@<path>`
  // tokens already in `composed` stay as harmless text references — the
  // image blocks below are what the model actually sees.
  const userContent =
    imageBlocks.length === 0
      ? promptText
      : [{ type: 'text', text: promptText }, ...imageBlocks];

  let usage = null;

  let api;
  try {
    api = client();
  } catch (err) {
    return runs.fail(run, 'AGENT_UNAVAILABLE', err && err.message ? err.message : String(err));
  }

  try {
    const stream = api.messages.stream({
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      messages: [{ role: 'user', content: userContent }],
    });

    stream.on('text', (delta) => {
      if (isAborted()) return;
      send('agent', { type: 'text_delta', delta });
    });

    stream.on('error', (err) => {
      if (isAborted()) return;
      const msg = err && err.message ? err.message : String(err);
      // Surface to the daemon journal so watch-errors.sh classifies it.
      log.error({ event: 'sdk_stream_error', model, runId: run?.id, err: msg }, 'anthropic SDK stream error');
      send('error', { message: msg });
    });

    const finalMessage = await stream.finalMessage();

    if (finalMessage && finalMessage.usage) {
      usage = {
        input_tokens: finalMessage.usage.input_tokens ?? null,
        output_tokens: finalMessage.usage.output_tokens ?? null,
        cache_creation_input_tokens: finalMessage.usage.cache_creation_input_tokens ?? null,
        cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens ?? null,
      };
    }

    if (!isAborted()) {
      send('agent', {
        type: 'usage',
        usage,
        costUsd: null,
        durationMs: null,
        stopReason: finalMessage?.stop_reason ?? null,
      });
      runs.finish(run, 'succeeded', 0, null);
    }
  } catch (err) {
    if (!isAborted()) {
      const msg = err && err.message ? err.message : String(err);
      log.error({ event: 'agent_failed', model, runId: run?.id, err: msg }, 'streamServerSide threw');
      runs.fail(run, 'AGENT_FAILED', msg);
    }
  }
}
