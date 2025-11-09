import {
  canAddAlias,
  getTimeUntilNextAlias,
  isValidEmail,
  formatDate,
} from '@/lib/business-logic';

describe('Business Logic Tests', () => {
  describe('canAddAlias', () => {
    it('should allow adding alias when no previous alias exists', () => {
      const result = canAddAlias(null);
      expect(result.canAdd).toBe(true);
      expect(result.message).toBe('Ready to add new alias');
    });

    it('should allow adding alias after 7 days', () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const result = canAddAlias(eightDaysAgo);
      expect(result.canAdd).toBe(true);
      expect(result.message).toBe('Ready to add new alias');
    });

    it('should not allow adding alias before 7 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = canAddAlias(threeDaysAgo);
      expect(result.canAdd).toBe(false);
      expect(result.daysRemaining).toBe(4);
      expect(result.nextAvailableDate).toBeDefined();
    });

    it('should allow adding exactly on the 7th day', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = canAddAlias(sevenDaysAgo);
      expect(result.canAdd).toBe(true);
    });

    it('should calculate correct days remaining', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = canAddAlias(oneDayAgo);
      expect(result.canAdd).toBe(false);
      expect(result.daysRemaining).toBe(6);
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
