import { PrismaClient } from '@prisma/client';

/**
 * Creates default AliExpress service for new users with:
 * - 7 fields: RegisterDate, TrackNumber, OrderDescription, isDelivered, isBanned, trackingStatus, lastTrackingUpdate
 * - 1 category: AliExpress Filters
 * - 2 filters: Ali Notreg and Ali Not delivered
 */
export async function createDefaultAliExpressService(prisma: PrismaClient) {
  try {
    // Check if AliExpress service already exists
    const existingService = await prisma.service.findUnique({
      where: { name: 'AliExpress' },
    });

    if (existingService) {
      console.log('AliExpress service already exists, skipping creation');
      return existingService;
    }

    // Create AliExpress service with specified fields
    const aliexpress = await prisma.service.create({
      data: {
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

    console.log('Created AliExpress service:', aliexpress.id);

    // Create filter category
    const category = await prisma.filterCategory.create({
      data: {
        name: 'AliExpress Filters',
        serviceId: aliexpress.id,
      },
    });

    console.log('Created AliExpress filter category:', category.id);

    // Create "Ali Notreg" filter - service not registered
    await prisma.filter.create({
      data: {
        name: 'Ali Notreg',
        categoryId: category.id,
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

    // Create "Ali Not delivered" filter
    await prisma.filter.create({
      data: {
        name: 'Ali Not delivered',
        categoryId: category.id,
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

    console.log('Created AliExpress filters');

    return aliexpress;
  } catch (error) {
    console.error('Error creating default AliExpress service:', error);
    throw error;
  }
}
