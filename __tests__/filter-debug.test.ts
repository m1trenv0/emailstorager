import { evaluateCondition, filterAliases } from '@/lib/filter-utils';
import { AliasWithStatus, FilterCondition } from '@/lib/types';

describe('Debug Service Registration Filtering', () => {
  const SERVICE_REGISTRATION_FIELD = '__service_registered__';

  // Mock aliases for debugging
  const aliases: AliasWithStatus[] = [
    {
      id: '1',
      accountId: 'acc1',
      email: 'with-augment@outlook.com',
      status: {
        Augment: {
          RegisterDate: '2025-11-09',
          Status: 'Active',
        },
      },
      comments: null,
      createdAt: new Date(),
      countsTowardLimit: true,
    },
    {
      id: '2',
      accountId: 'acc2',
      email: 'z_albs@outlook.com',
      status: {}, // No services
      comments: null,
      createdAt: new Date(),
      countsTowardLimit: true,
    },
    {
      id: '3',
      accountId: 'acc3',
      email: 'with-aliexpress@outlook.com',
      status: {
        AliExpress: {
          RegisterDate: '2025-11-10',
        },
      },
      comments: null,
      createdAt: new Date(),
      countsTowardLimit: true,
    },
  ];

  test('Debug: Filter with not_exists should show aliases without Augment', () => {
    const notExistsCondition: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'not_exists',
    };

    console.log('\n=== Testing NOT EXISTS for Augment ===');
    aliases.forEach((alias) => {
      const result = evaluateCondition(alias, notExistsCondition, 'Augment');
      console.log(
        `Alias: ${alias.email}, Has Augment: ${!!alias.status.Augment}, Result: ${result}`
      );
    });

    const filtered = filterAliases(aliases, [notExistsCondition], 'Augment');
    console.log(
      `\nFiltered results (${filtered.length}):`,
      filtered.map((a) => a.email)
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.email)).toContain('z_albs@outlook.com');
    expect(filtered.map((a) => a.email)).toContain(
      'with-aliexpress@outlook.com'
    );
  });

  test('Debug: Filter with exists should show aliases with Augment', () => {
    const existsCondition: FilterCondition = {
      field: SERVICE_REGISTRATION_FIELD,
      operator: 'exists',
    };

    console.log('\n=== Testing EXISTS for Augment ===');
    aliases.forEach((alias) => {
      const result = evaluateCondition(alias, existsCondition, 'Augment');
      console.log(
        `Alias: ${alias.email}, Has Augment: ${!!alias.status.Augment}, Result: ${result}`
      );
    });

    const filtered = filterAliases(aliases, [existsCondition], 'Augment');
    console.log(
      `\nFiltered results (${filtered.length}):`,
      filtered.map((a) => a.email)
    );

    expect(filtered).toHaveLength(1);
    expect(filtered.map((a) => a.email)).toContain('with-augment@outlook.com');
  });
});