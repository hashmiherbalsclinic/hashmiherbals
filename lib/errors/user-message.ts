/** Map technical / API errors to short messages for customers and admins. */

export function toUserFacingError(
  error: unknown,
  audience: "customer" | "admin" = "customer"
): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Something went wrong.";

  const msg = raw.trim();

  if (/Failed to fetch|NetworkError|fetch failed|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
    return audience === "admin"
      ? "Network error — check your connection and try again."
      : "We couldn’t reach the server. Please check your internet and try again.";
  }

  if (/JWT|session|Auth session missing|not signed in|Invalid Refresh Token/i.test(msg)) {
    return audience === "admin"
      ? "Your admin session expired. Please sign in again."
      : "Please sign in again to continue.";
  }

  if (/row-level security|42501|permission denied|not authorized|RLS/i.test(msg)) {
    return audience === "admin"
      ? "Permission denied. Confirm your account has admin access."
      : "You don’t have permission to do that.";
  }

  if (/quota|rate.?limit|resource.?exhausted|429/i.test(msg)) {
    return audience === "admin"
      ? msg // keep Gemini quota detail for admins
      : "The service is busy right now. Please try again in a few minutes.";
  }

  if (/duplicate key|unique constraint|already exists/i.test(msg)) {
    return audience === "admin"
      ? "This record already exists (duplicate slug or ID)."
      : "That item already exists. Please use a different name.";
  }

  if (/timeout|ETIMEDOUT|aborted/i.test(msg)) {
    return "This took too long. Please try again.";
  }

  if (/supabase|postgres|PGRST|column .* does not exist/i.test(msg)) {
    return audience === "admin"
      ? `Database error: ${msg.slice(0, 180)}`
      : "We’re having a temporary data issue. Please try again shortly.";
  }

  // Already short & readable
  if (msg.length > 0 && msg.length < 220 && !/at\s+\w+|TypeError|ReferenceError|stack/i.test(msg)) {
    return msg;
  }

  return audience === "admin"
    ? "Something went wrong in admin. Try again, or refresh the page."
    : "Something went wrong. Please try again. If it continues, contact us on WhatsApp.";
}

export function logAppError(scope: string, error: unknown) {
  console.error(`[${scope}]`, error);
}
