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

// Parses a generic API error response into field-level error messages.
// Joins array values into a single string and falls back to a generic message.
export function normalizeErrors(err: unknown): FieldErrors {
  const errors: FieldErrors = {};
  if (err && typeof err === "object") {
    for (const [key, value] of Object.entries(err as DjangoErrorResponse)) {
      if (Array.isArray(value)) {
        errors[key] = value.join(" ");
      } else if (typeof value === "string") {
        errors[key] = value;
      }
    }
  }
  if (Object.keys(errors).length === 0) {
    errors.general = "An unexpected error occurred.";
  }
  return errors;
}
