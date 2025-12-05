/**
 * Date formatting utilities
 * Centralized date formatting for consistent display across the app
 */

/**
 * Format date with full details including time
 * @example "January 15, 2024, 02:30 PM"
 */
export function formatDateLong(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date in short format
 * @example "Jan 15, 2024"
 */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date with medium detail
 * @example "January 15, 2024"
 */
export function formatDateMedium(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date as ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}
