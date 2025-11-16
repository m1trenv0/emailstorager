import { evaluateCondition } from '@/lib/filter-utils';
import { AliasWithStatus, FilterCondition } from '@/lib/types';

describe('Service Registration Filtering', () => {
  const SERVICE_REGISTRATION_FIELD = '__service_registered__';

  // Mock alias with Augment service
  const aliasWithAugment: AliasWithStatus = {
    id: '1',
    accountId: 'acc1',
    email: 'test@outlook.com',
    status: {
      Augment: {
        RegisterDate: '2025-11-09',
        Status: 'Active',
      },
    },
    comments: null,
    createdAt: new Date(),
    countsTowardLimit: true,
  };

  // Mock alias without Augment service
  const aliasWithoutAugment: AliasWithStatus = {
    id: '2',
    accountId: 'acc2',
    email: 'z_albs@outlook.com',
    status: {},
    comments: null,
    createdAt: new Date(),
    countsTowardLimit: true,
  };

  // Mock alias with other services but not Augment
  const aliasWithOtherService: AliasWithStatus = {
    id: '3',
    accountId: 'acc3',
    email: 'other@outlook.com',
    status: {
      AliExpress: {
        RegisterDate: '2025-11-10',
      },
    },
    comments: null,
    createdAt: new Date(),
    countsTowardLimit: true,
  };

  describe('Service Registration Status - exists operator', () => {
    const existsCondition: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'exists',
    };

    test('should return true for alias with the service', () => {
      const result = evaluateCondition(
        aliasWithAugment,
        existsCondition,
        'Augment'
      );
      expect(result).toBe(true);
    });

    test('should return false for alias without the service', () => {
      const result = evaluateCondition(
        aliasWithoutAugment,
        existsCondition,
        'Augment'
      );
      expect(result).toBe(false);
    });

    test('should return false for alias with other services only', () => {
      const result = evaluateCondition(
        aliasWithOtherService,
        existsCondition,
        'Augment'
      );
      expect(result).toBe(false);
    });
  });

  describe('Service Registration Status - not_exists operator', () => {
    const notExistsCondition: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'not_exists',
    };

    test('should return false for alias with the service', () => {
      const result = evaluateCondition(
        aliasWithAugment,
        notExistsCondition,
        'Augment'
      );
      expect(result).toBe(false);
    });

    test('should return true for alias without the service', () => {
      const result = evaluateCondition(
        aliasWithoutAugment,
        notExistsCondition,
        'Augment'
      );
      expect(result).toBe(true);
    });

    test('should return true for alias with other services only', () => {
      const result = evaluateCondition(
        aliasWithOtherService,
        notExistsCondition,
        'Augment'
      );
      expect(result).toBe(true);
    });
  });

  describe('Regular field filtering still works', () => {
    const registerDateCondition: FilterCondition = {
      field: 'RegisterDate',
      operator: 'exists',
    };

    test('should return true for alias with RegisterDate field', () => {
      const result = evaluateCondition(
        aliasWithAugment,
        registerDateCondition,
        'Augment'
      );
      expect(result).toBe(true);
    });

    test('should return false for alias without the service (field does not exist)', () => {
      const result = evaluateCondition(
        aliasWithoutAugment,
        registerDateCondition,
        'Augment'
      );
      expect(result).toBe(false);
    });
  });

  describe('Real-world use case: Find accounts not registered on Augment', () => {
    const notRegisteredFilter: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'not_exists',
    };

    test('should filter out accounts not registered on Augment', () => {
      const allAliases = [
        aliasWithAugment,
        aliasWithoutAugment,
        aliasWithOtherService,
      ];

      const notRegistered = allAliases.filter((alias) =>
        evaluateCondition(alias, notRegisteredFilter, 'Augment')
      );

      expect(notRegistered).toHaveLength(2);
      expect(notRegistered).toContain(aliasWithoutAugment);
      expect(notRegistered).toContain(aliasWithOtherService);
      expect(notRegistered).not.toContain(aliasWithAugment);
    });
  });

  describe('Real-world use case: Find accounts registered on AliExpress', () => {
    const registeredFilter: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'exists',
    };

    test('should filter accounts registered on AliExpress', () => {
      const allAliases = [
        aliasWithAugment,
        aliasWithoutAugment,
        aliasWithOtherService,
      ];

      const registered = allAliases.filter((alias) =>
        evaluateCondition(alias, registeredFilter, 'AliExpress')
      );

      expect(registered).toHaveLength(1);
      expect(registered).toContain(aliasWithOtherService);
    });
  });
});