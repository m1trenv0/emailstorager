/**
 * Business logic utilities for Email Storage Manager
 */

export interface AliasAdditionResult {
  canAdd: boolean;
  daysRemaining?: number;
  nextAvailableDate?: Date;
  message?: string;
}

/**
 * Check if a new alias can be added based on the 7-day limit rule
 * @param lastAliasAddedAt - The date when the last alias was added
 * @returns Object indicating whether an alias can be added and related info
 */
export function canAddAlias(
  lastAliasAddedAt: Date | null
): AliasAdditionResult {
  // If no alias has been added yet, allow adding
  if (!lastAliasAddedAt) {
    return {
      canAdd: true,
      message: 'Ready to add new alias',
    };
  }

  const lastAdded = new Date(lastAliasAddedAt);
  const now = new Date();
  const daysSinceLastAlias = Math.floor(
    (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If 7 or more days have passed, allow adding
  if (daysSinceLastAlias >= 7) {
    return {
      canAdd: true,
      message: 'Ready to add new alias',
    };
  }

  // Calculate remaining days and next available date
  const daysRemaining = 7 - daysSinceLastAlias;
  const nextAvailable = new Date(lastAdded);
  nextAvailable.setDate(nextAvailable.getDate() + 7);

  return {
    canAdd: false,
    daysRemaining,
    nextAvailableDate: nextAvailable,
    message: `Cannot add alias yet. ${daysRemaining} day(s) remaining.`,
  };
}

/**
 * Calculate time remaining until next alias can be added
 * @param lastAliasAddedAt - The date when the last alias was added
 * @returns Object with days, hours, and minutes remaining, or null if alias can be added
 */
export function getTimeUntilNextAlias(
  lastAliasAddedAt: Date | null
): { days: number; hours: number; minutes: number } | null {
  if (!lastAliasAddedAt) return null;

  const lastAdded = new Date(lastAliasAddedAt);
  const nextAvailable = new Date(lastAdded);
  nextAvailable.setDate(nextAvailable.getDate() + 7);

  const now = new Date();
  const diff = nextAvailable.getTime() - now.getTime();

  // If time has passed or is exactly now, return null
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
