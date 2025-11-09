import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Seed AliExpress service
  const aliexpress = await prisma.service.upsert({
    where: { name: 'AliExpress' },
    update: {},
    create: {
      name: 'AliExpress',
      description: 'AliExpress account service',
      fields: [
        {
          name: 'registerDate',
          type: 'date',
          required: false,
          description: 'Registration date (indicates isRegistered)',
        },
        {
          name: 'trackNumber',
          type: 'string',
          required: false,
          description: 'Tracking number for orders',
        },
        {
          name: 'shortDescription',
          type: 'string',
          required: false,
          dependsOn: ['trackNumber'],
          description: 'Short description (requires track number)',
        },
        {
          name: 'isDelivered',
          type: 'boolean',
          required: false,
          dependsOn: ['trackNumber'],
          description: 'Delivery status (requires track number)',
        },
        {
          name: 'isBanned',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Account ban status',
        },
      ],
    },
  });

  console.log('Created/Updated AliExpress service:', aliexpress.id);

  // Seed Augment service
  const augment = await prisma.service.upsert({
    where: { name: 'Augment' },
    update: {},
    create: {
      name: 'Augment',
      description: 'Augment account service',
      fields: [
        {
          name: 'register',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Registration status',
        },
        {
          name: 'isBanned',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Account ban status',
        },
      ],
    },
  });

  console.log('Created/Updated Augment service:', augment.id);

  // Create default filter categories for AliExpress
  const aliexpressCategory = await prisma.filterCategory.upsert({
    where: { id: 'default-aliexpress-category' },
    update: {},
    create: {
      id: 'default-aliexpress-category',
      name: 'AliExpress Filters',
      serviceId: aliexpress.id,
    },
  });

  console.log(
    'Created/Updated AliExpress filter category:',
    aliexpressCategory.id
  );

  // Create default filters for AliExpress
  await prisma.filter.upsert({
    where: { id: 'filter-aliexpress-available' },
    update: {},
    create: {
      id: 'filter-aliexpress-available',
      name: 'Available to add aliases',
      categoryId: aliexpressCategory.id,
      conditions: [
        {
          field: 'isBanned',
          operator: 'equals',
          value: false,
        },
        {
          field: 'registerDate',
          operator: 'exists',
          value: null,
        },
      ],
    },
  });

  await prisma.filter.upsert({
    where: { id: 'filter-aliexpress-delivered' },
    update: {},
    create: {
      id: 'filter-aliexpress-delivered',
      name: 'Delivered orders',
      categoryId: aliexpressCategory.id,
      conditions: [
        {
          field: 'isDelivered',
          operator: 'equals',
          value: true,
        },
      ],
    },
  });

  await prisma.filter.upsert({
    where: { id: 'filter-aliexpress-pending' },
    update: {},
    create: {
      id: 'filter-aliexpress-pending',
      name: 'Pending registration',
      categoryId: aliexpressCategory.id,
      conditions: [
        {
          field: 'registerDate',
          operator: 'not_exists',
          value: null,
        },
      ],
    },
  });

  console.log('Created/Updated AliExpress filters');

  // Create default filter categories for Augment
  const augmentCategory = await prisma.filterCategory.upsert({
    where: { id: 'default-augment-category' },
    update: {},
    create: {
      id: 'default-augment-category',
      name: 'Augment Filters',
      serviceId: augment.id,
    },
  });

  console.log('Created/Updated Augment filter category:', augmentCategory.id);

  // Create default filters for Augment
  await prisma.filter.upsert({
    where: { id: 'filter-augment-registered' },
    update: {},
    create: {
      id: 'filter-augment-registered',
      name: 'Registered accounts',
      categoryId: augmentCategory.id,
      conditions: [
        {
          field: 'register',
          operator: 'equals',
          value: true,
        },
      ],
    },
  });

  await prisma.filter.upsert({
    where: { id: 'filter-augment-not-banned' },
    update: {},
    create: {
      id: 'filter-augment-not-banned',
      name: 'Not banned accounts',
      categoryId: augmentCategory.id,
      conditions: [
        {
          field: 'isBanned',
          operator: 'equals',
          value: false,
        },
      ],
    },
  });

  console.log('Created/Updated Augment filters');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
