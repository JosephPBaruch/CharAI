/**
 * Format an ISO timestamp into a user-friendly relative or absolute string.
 *
 * Returns relative format (e.g. "2 hours ago") for timestamps within the last
 * 24 hours, and a short absolute format (e.g. "Mar 15, 2026 3:42 PM") for
 * older timestamps.
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Format a price value with currency symbol and unit.
 */
export function formatPrice(price: string | number, unit: string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "-";
  return `$${num.toFixed(2)}/${unit}`;
}

/**
 * Truncate a UUID or long string to a shorter display form.
 */
export function truncateId(id: string, maxLength = 8): string {
  if (!id || id.length <= maxLength) return id;
  return id.slice(0, maxLength) + "\u2026";
}
