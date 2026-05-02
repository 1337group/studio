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
import { readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { extname, resolve as pathResolve, basename, dirname, relative as pathRelative } from 'node:path';
import baseLogger from './logger.js';

const log = baseLogger.child({ component: 'anthropic-server' });

// MERGE-NOTE: studio — Anthropic tool definitions for filesystem ops the
// model can actually invoke. Without these the model would say "Use the Edit
// tool" and lie about doing it (no tool plumbing → hallucination). Each
// tool is sandboxed to the project's cwd via resolveSafe.
const TOOL_DEFS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the current project. Path must be relative to the project root.',
    input_schema: {
      type: 'object' as const,
      properties: { path: { type: 'string', description: 'Project-relative path' } },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write (create or overwrite) a file in the current project. Path must be relative to the project root. Use for new files OR full rewrites of existing files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Project-relative path' },
        content: { type: 'string', description: 'Full file content' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description: 'Surgical edit of an existing file: replace the FIRST exact match of old_string with new_string. Fails if old_string is not found or appears more than once. Use for targeted edits where you do not want to rewrite the whole file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Project-relative path' },
        old_string: { type: 'string', description: 'Exact text to find (must appear exactly once)' },
        new_string: { type: 'string', description: 'Replacement text' },
      },
      required: ['path', 'old_string', 'new_string'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in the current project (recursive). Use to discover what files already exist before writing.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];

function resolveSafe(cwd, relPath) {
  if (typeof relPath !== 'string' || !relPath.length) throw new Error('path required');
  if (relPath.includes('\0') || relPath.startsWith('/') || /^[A-Za-z]:/.test(relPath)) {
    throw new Error('absolute paths not allowed');
  }
  const abs = pathResolve(cwd, relPath);
  if (abs !== cwd && !abs.startsWith(cwd + '/')) {
    throw new Error('path escapes project directory');
  }
  return abs;
}

function listProjectFilesRecursive(cwd, base = cwd, acc = []) {
  const fs = require('node:fs');
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = pathResolve(base, entry.name);
    if (entry.isDirectory()) {
      listProjectFilesRecursive(cwd, full, acc);
    } else {
      acc.push(pathRelative(cwd, full));
    }
  }
  return acc;
}

function executeToolCall(toolName, input, cwd) {
  if (!cwd) return { error: 'no project cwd available — cannot use filesystem tools' };
  try {
    switch (toolName) {
      case 'read_file': {
        const p = resolveSafe(cwd, input?.path);
        const text = readFileSync(p, 'utf8');
        return { content: text.length > 200000 ? text.slice(0, 200000) + '\n…[truncated at 200KB]' : text };
      }
      case 'write_file': {
        const p = resolveSafe(cwd, input?.path);
        if (typeof input?.content !== 'string') return { error: 'content must be a string' };
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, input.content, 'utf8');
        return { ok: true, bytes: input.content.length, path: input.path };
      }
      case 'edit_file': {
        const p = resolveSafe(cwd, input?.path);
        if (!existsSync(p)) return { error: `file not found: ${input.path}` };
        const cur = readFileSync(p, 'utf8');
        const occ = cur.split(input.old_string).length - 1;
        if (occ === 0) return { error: 'old_string not found in file' };
        if (occ > 1) return { error: `old_string matched ${occ} times — must be unique. Add more context.` };
        const next = cur.replace(input.old_string, input.new_string);
        writeFileSync(p, next, 'utf8');
        return { ok: true, oldBytes: cur.length, newBytes: next.length, path: input.path };
      }
      case 'list_files': {
        return { files: listProjectFilesRecursive(cwd) };
      }
      default:
        return { error: `unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { error: err && err.message ? err.message : String(err) };
  }
}

// MERGE-NOTE: studio — Anthropic's hard model-side ceiling for Claude 4
// output is 64000 tokens (no API call can exceed this — request 65536 and
// you get a validation error). We default to 64000 so HTML artifacts never
// get truncated. Override via STUDIO_MAX_TOKENS env if you need to throttle
// (lower bound 1024). Locked 2026-05-02 after dunsire-home-9.html cut off
// at 19KB / 8K output tokens.
const DEFAULT_MAX_TOKENS = (() => {
  const env = Number.parseInt(process.env.STUDIO_MAX_TOKENS ?? '', 10);
  if (Number.isFinite(env) && env >= 1024 && env <= 64000) return env;
  return 64000;
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
  composed,            // legacy single-string fallback
  safeModel,
  safeImages,
  safeAttachments,
  cwd,
  run,
  runs,
  // MERGE-NOTE: studio — structured-conversation params (preferred path).
  // When messageHistory is supplied, we ignore `composed` and build a proper
  // Anthropic messages array. system prompt goes to Anthropic's `system`
  // parameter (not crammed into a user message).
  instructionPrompt,
  messageHistory,
  userMessage,
  attachmentHint,
  commentHint,
  cwdHint,
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

  // Build proper Anthropic messages array. Two paths:
  //   - structured (preferred): messageHistory from frontend → role-tagged turns
  //   - legacy: single user message containing flattened `composed` transcript
  let api;
  try {
    api = client();
  } catch (err) {
    return runs.fail(run, 'AGENT_UNAVAILABLE', err && err.message ? err.message : String(err));
  }

  // System prompt — Anthropic API channel, NOT crammed into a user message.
  const systemPromptText = (() => {
    const parts = [];
    if (typeof instructionPrompt === 'string' && instructionPrompt.trim()) parts.push(instructionPrompt);
    if (typeof cwdHint === 'string' && cwdHint.trim()) parts.push(cwdHint);
    if (textInlines.length > 0) parts.push(renderTextInlines(textInlines));
    return parts.join('\n\n').trim();
  })();

  // Latest user turn: text + images + attachment hints. Build content blocks.
  const latestUserText = (() => {
    if (typeof userMessage === 'string' && userMessage.trim()) {
      return [
        userMessage,
        typeof attachmentHint === 'string' ? attachmentHint : '',
        typeof commentHint === 'string' ? commentHint : '',
      ].join('').trim();
    }
    return composed; // fallback to legacy composed if frontend didn't send userMessage
  })();
  const latestUserContent = imageBlocks.length === 0
    ? latestUserText
    : [{ type: 'text', text: latestUserText || '(see attachments)' }, ...imageBlocks];

  // Assemble messages array. If frontend sent structured history, use it
  // (drop the trailing user turn it includes since latestUserContent is
  // built fresh with images). Otherwise fall back to single-message legacy.
  let messages;
  if (Array.isArray(messageHistory) && messageHistory.length > 0) {
    // Drop the final entry if it's a user turn (we'll append latestUserContent).
    const histCopy = [...messageHistory];
    if (histCopy.length > 0 && histCopy[histCopy.length - 1].role === 'user') {
      histCopy.pop();
    }
    messages = [
      ...histCopy.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: latestUserContent },
    ];
  } else {
    messages = [{ role: 'user', content: latestUserContent }];
  }

  // Tool-use loop: stream → if model wants a tool call, execute, append
  // tool_result, stream next turn. Continue until stop_reason='end_turn'.
  // Hard cap at 12 iterations to prevent infinite loops.
  let usage = null;
  let stopReason = null;
  const MAX_TOOL_ITERATIONS = 12;

  try {
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      if (isAborted()) break;
      const streamArgs = {
        model,
        max_tokens: DEFAULT_MAX_TOKENS,
        messages,
        tools: TOOL_DEFS,
      };
      if (systemPromptText) streamArgs.system = systemPromptText;

      const stream = api.messages.stream(streamArgs);

      stream.on('text', (delta) => {
        if (isAborted()) return;
        send('agent', { type: 'text_delta', delta });
      });
      stream.on('error', (err) => {
        if (isAborted()) return;
        const msg = err && err.message ? err.message : String(err);
        log.error({ event: 'sdk_stream_error', model, runId: run?.id, err: msg, iter }, 'anthropic SDK stream error');
        send('error', { message: msg });
      });

      const finalMessage = await stream.finalMessage();
      if (!finalMessage) break;

      // Surface tool_use blocks to the frontend AND collect for execution.
      const toolUses = [];
      for (const block of finalMessage.content || []) {
        if (block?.type === 'tool_use') {
          toolUses.push(block);
          send('agent', {
            type: 'tool_use',
            id: block.id,
            name: block.name,
            input: block.input,
          });
        }
      }

      // Update usage with the LATEST iteration (cumulative-ish; final wins).
      if (finalMessage.usage) {
        usage = {
          input_tokens: finalMessage.usage.input_tokens ?? null,
          output_tokens: finalMessage.usage.output_tokens ?? null,
          cache_creation_input_tokens: finalMessage.usage.cache_creation_input_tokens ?? null,
          cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens ?? null,
        };
      }
      stopReason = finalMessage.stop_reason ?? null;

      // If the model didn't ask for a tool, we're done.
      if (toolUses.length === 0 || stopReason !== 'tool_use') break;

      // Append assistant turn (with tool_use blocks) + tool_result turn.
      messages.push({ role: 'assistant', content: finalMessage.content });
      const toolResults = toolUses.map((t) => {
        const result = executeToolCall(t.name, t.input || {}, cwd);
        send('agent', {
          type: 'tool_result',
          tool_use_id: t.id,
          name: t.name,
          isError: Boolean(result?.error),
          output: typeof result === 'string' ? result : JSON.stringify(result),
        });
        return {
          type: 'tool_result',
          tool_use_id: t.id,
          is_error: Boolean(result?.error),
          content: typeof result === 'string' ? result : JSON.stringify(result),
        };
      });
      messages.push({ role: 'user', content: toolResults });
    }

    if (!isAborted()) {
      // MERGE-NOTE: studio — `stopReason` is the outer-scope let from line ~406,
      // assigned inside the loop on each iteration. Earlier code re-declared a
      // local `const stopReason = finalMessage?.stop_reason` here, but
      // `finalMessage` is block-scoped to the for-loop body (line ~433) and
      // out-of-scope after `break`, throwing ReferenceError → AGENT_FAILED →
      // red error pill in chat panel. Use the outer.
      // Flag truncation as a journal warning so watch-errors.sh classifies it
      // as MAX_TOKENS_HIT. Without this, a truncated artifact looks like a
      // "succeeded" run from the journal's perspective and the operator only
      // finds out when a user complains.
      if (stopReason && stopReason !== 'end_turn' && stopReason !== 'tool_use') {
        log.warn(
          {
            event: 'stop_reason_non_terminal',
            stopReason,
            model,
            runId: run?.id,
            outputTokens: usage?.output_tokens ?? null,
            maxTokens: DEFAULT_MAX_TOKENS,
          },
          `agent stopped with non-terminal stop_reason="${stopReason}" — output likely truncated`,
        );
      }
      send('agent', {
        type: 'usage',
        usage,
        costUsd: null,
        durationMs: null,
        stopReason,
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
