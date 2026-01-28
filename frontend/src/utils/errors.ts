import { type FieldErrors, type DjangoErrorResponse } from "../types/auth.ts";

// Parses signup error response for field-specific errors, improving UX and simplifying frontend component code
export function normalizeSignupErrors(error: DjangoErrorResponse): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const field in error) {
    const messages = error[field];
    if (!messages || messages.length === 0) continue;

    fieldErrors[field] = messages[0];
  }

  return fieldErrors;
}
