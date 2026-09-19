import { google } from "@ai-sdk/google";

/** Primary free-tier default (~500 RPD). */
export const DEFAULT_BLOG_MODEL = "gemini-3.5-flash-lite";

/**
 * Ordered failover chain when a model is quota-exhausted or unavailable.
 * Prefer higher free RPD first, then stronger Flash models.
 */
const BUILTIN_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
] as const;

/** Skip a model for a few minutes after quota/unavailable (same server process). */
const COOLDOWN_MS = 15 * 60 * 1000;
const modelCooldownUntil = new Map<string, number>();

export type GeminiRunResult<T> = {
  data: T;
  modelId: string;
  attempted: string[];
};

function errorMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) {
    const anyErr = err as Error & {
      cause?: unknown;
      data?: unknown;
      responseBody?: string;
      statusCode?: number;
    };
    const parts = [err.message, err.name];
    if (anyErr.statusCode) parts.push(String(anyErr.statusCode));
    if (typeof anyErr.responseBody === "string") parts.push(anyErr.responseBody);
    if (anyErr.cause) parts.push(errorMessage(anyErr.cause));
    if (anyErr.data) parts.push(JSON.stringify(anyErr.data));
    return parts.filter(Boolean).join(" | ");
  }
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function isQuotaError(message: string) {
  return /quota|rate.?limit|resource.?exhausted|429|Too Many Requests|limit:\s*0|free_tier/i.test(
    message
  );
}

export function isUnavailableModelError(message: string) {
  return /no longer available|not found|not supported|404|INVALID_ARGUMENT.*model|is not found for API version/i.test(
    message
  );
}

function shouldFailover(message: string) {
  return isQuotaError(message) || isUnavailableModelError(message);
}

function markCooldown(modelId: string, message: string) {
  if (shouldFailover(message)) {
    modelCooldownUntil.set(modelId, Date.now() + COOLDOWN_MS);
  }
}

function isCoolingDown(modelId: string) {
  const until = modelCooldownUntil.get(modelId);
  if (!until) return false;
  if (Date.now() >= until) {
    modelCooldownUntil.delete(modelId);
    return false;
  }
  return true;
}

/**
 * Build ordered model list:
 * 1) GEMINI_BLOG_MODELS=a,b,c  (full custom chain), or
 * 2) GEMINI_BLOG_MODEL + built-in fallbacks
 */
export function resolveBlogModels(): string[] {
  const custom = process.env.GEMINI_BLOG_MODELS?.trim();
  if (custom) {
    return Array.from(
      new Set(
        custom
          .split(/[,|\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
  }

  const primary = process.env.GEMINI_BLOG_MODEL?.trim() || DEFAULT_BLOG_MODEL;
  return Array.from(new Set([primary, ...BUILTIN_CHAIN]));
}

/**
 * Try models in order. On quota / unavailable, cool that model down and
 * automatically use the next one.
 */
export async function withGeminiModelFallback<T>(
  run: (model: ReturnType<typeof google>, modelId: string) => Promise<T>
): Promise<GeminiRunResult<T>> {
  const models = resolveBlogModels();
  const attempted: string[] = [];
  let lastError: unknown;

  // Prefer models not in cooldown; if all cooling, try them anyway in order.
  const ordered = [
    ...models.filter((id) => !isCoolingDown(id)),
    ...models.filter((id) => isCoolingDown(id)),
  ];

  for (let i = 0; i < ordered.length; i++) {
    const id = ordered[i];
    attempted.push(id);
    try {
      const data = await run(google(id), id);
      return { data, modelId: id, attempted };
    } catch (err) {
      lastError = err;
      const message = errorMessage(err);
      const canRetry = i < ordered.length - 1 && shouldFailover(message);
      markCooldown(id, message);
      console.warn(
        `[gemini] ${id} failed${canRetry ? " → trying next model" : ""}:`,
        message.slice(0, 400)
      );
      if (!canRetry) break;
    }
  }

  const message = errorMessage(lastError);
  const tried = attempted.join(" → ");
  if (isQuotaError(message)) {
    throw new Error(
      `All Gemini models are out of free-tier quota right now (tried: ${tried}). Wait for daily reset (midnight US Pacific) or enable billing in AI Studio.`
    );
  }
  throw lastError instanceof Error
    ? new Error(`${lastError.message} (tried: ${tried})`)
    : new Error(`All Gemini models failed (tried: ${tried}).`);
}

export function geminiUserError(message: string): string | null {
  if (/API key|PERMISSION|401|403/i.test(message)) {
    return "Gemini API key rejected. Check GOOGLE_GENERATIVE_AI_API_KEY.";
  }
  if (isQuotaError(message) || /All Gemini models are out/i.test(message)) {
    return message.includes("tried:")
      ? message
      : "Gemini free-tier quota used up. The app will auto-switch models; if all fail, wait for reset or enable billing.";
  }
  return null;
}
