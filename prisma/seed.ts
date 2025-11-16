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
      description: 'AliExpress order tracking service',
      fields: [
        {
          name: 'RegisterDate',
          type: 'date',
          required: true,
          description: 'Service registration date',
        },
        {
          name: 'TrackNumber',
          type: 'string',
          required: false,
          description: 'Package tracking number',
        },
        {
          name: 'OrderDescription',
          type: 'string',
          required: false,
          description: 'Order description',
        },
        {
          name: 'isDelivered',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Delivery status (auto-updated via 17TRACK)',
        },
        {
          name: 'isBanned',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Ban status',
        },
        {
          name: 'trackingStatus',
          type: 'string',
          required: false,
          description: 'Current tracking status from 17TRACK API',
        },
        {
          name: 'lastTrackingUpdate',
          type: 'string',
          required: false,
          description: 'Last time tracking was updated (ISO date string)',
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
    where: { id: 'filter-aliexpress-notreg' },
    update: {},
    create: {
      id: 'filter-aliexpress-notreg',
      name: 'Ali Notreg',
      categoryId: aliexpressCategory.id,
      conditions: [
        {
          field: '__service_registered__',
          operator: 'not_exists',
        },
      ],
      showAsTab: true,
      tabOrder: 0,
    },
  });

  await prisma.filter.upsert({
    where: { id: 'filter-aliexpress-not-delivered' },
    update: {},
    create: {
      id: 'filter-aliexpress-not-delivered',
      name: 'Ali Not delivered',
      categoryId: aliexpressCategory.id,
      conditions: [
        {
          field: 'TrackNumber',
          operator: 'exists',
        },
        {
          field: 'isDelivered',
          operator: 'equals',
          value: false,
        },
      ],
      showAsTab: true,
      tabOrder: 1,
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
