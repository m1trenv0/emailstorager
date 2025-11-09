import {
  canAddAlias,
  getTimeUntilNextAlias,
  isValidEmail,
  formatDate,
} from '@/lib/business-logic';

describe('Business Logic Tests', () => {
  describe('canAddAlias - 2 aliases per 7 days', () => {
    it('should allow adding alias when no previous alias exists', () => {
      const result = canAddAlias(null, 0);
      expect(result.canAdd).toBe(true);
      expect(result.message).toBe('Ready to add new alias');
      expect(result.aliasesRemaining).toBe(2);
    });

    it('should allow adding first alias in new period after 7 days', () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const result = canAddAlias(eightDaysAgo, 2);
      expect(result.canAdd).toBe(true);
      expect(result.message).toBe('Ready to add new alias');
      expect(result.aliasesRemaining).toBe(2);
    });

    it('should allow adding second alias within 7 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = canAddAlias(threeDaysAgo, 1);
      expect(result.canAdd).toBe(true);
      expect(result.message).toContain('1 remaining');
      expect(result.aliasesRemaining).toBe(1);
    });

    it('should not allow adding alias when 2 aliases already added within 7 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = canAddAlias(threeDaysAgo, 2);
      expect(result.canAdd).toBe(false);
      expect(result.daysRemaining).toBe(4);
      expect(result.nextAvailableDate).toBeDefined();
      expect(result.aliasesRemaining).toBe(0);
    });

    it('should allow adding exactly on the 7th day (reset period)', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = canAddAlias(sevenDaysAgo, 2);
      expect(result.canAdd).toBe(true);
      expect(result.aliasesRemaining).toBe(2);
    });

    it('should calculate correct days remaining when limit reached', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = canAddAlias(oneDayAgo, 2);
      expect(result.canAdd).toBe(false);
      expect(result.daysRemaining).toBe(6);
    });

    it('should show correct remaining aliases count', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // 0 aliases added - should have 2 remaining
      let result = canAddAlias(twoDaysAgo, 0);
      expect(result.canAdd).toBe(true);
      expect(result.aliasesRemaining).toBe(2);

      // 1 alias added - should have 1 remaining
      result = canAddAlias(twoDaysAgo, 1);
      expect(result.canAdd).toBe(true);
      expect(result.aliasesRemaining).toBe(1);

      // 2 aliases added - should have 0 remaining
      result = canAddAlias(twoDaysAgo, 2);
      expect(result.canAdd).toBe(false);
      expect(result.aliasesRemaining).toBe(0);
    });
  });

  describe('getTimeUntilNextAlias', () => {
    it('should return null when no previous alias exists', () => {
      const result = getTimeUntilNextAlias(null);
      expect(result).toBeNull();
    });

    it('should return null when 7 days have passed', () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const result = getTimeUntilNextAlias(eightDaysAgo);
      expect(result).toBeNull();
    });

    it('should calculate time remaining correctly', () => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const result = getTimeUntilNextAlias(sixDaysAgo);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.days).toBeGreaterThanOrEqual(0);
        expect(result.hours).toBeGreaterThanOrEqual(0);
        expect(result.minutes).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return approximately 7 days for just added alias', () => {
      const justNow = new Date();

      const result = getTimeUntilNextAlias(justNow);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.days).toBeGreaterThanOrEqual(6);
        expect(result.days).toBeLessThanOrEqual(7);
        expect(result.hours).toBeLessThanOrEqual(24);
      }
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(isValidEmail('name+tag@company.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan/);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/2024/);
    });

    it('should handle different dates', () => {
      const date = new Date('2023-12-31');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Dec/);
      expect(formatted).toMatch(/31/);
      expect(formatted).toMatch(/2023/);
    });
  });
});
