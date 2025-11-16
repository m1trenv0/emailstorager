import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/middleware';

// POST /api/filter-categories/sync - Create filter categories for services that don't have them
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    console.log('Creating filter categories for existing services...');

    // Get all services
    const services = await prisma.service.findMany();

    const results = [];

    for (const service of services) {
      // Check if the service already has a filter category
      const existingCategory = await prisma.filterCategory.findFirst({
        where: { serviceId: service.id },
      });

      if (!existingCategory) {
        // Create a default filter category for this service
        const category = await prisma.filterCategory.create({
          data: {
            name: `${service.name} Filters`,
            serviceId: service.id,
          },
        });

        results.push({
          service: service.name,
          category: category.name,
          created: true,
        });
      } else {
        results.push({
          service: service.name,
          category: existingCategory.name,
          created: false,
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Filter category synchronization completed',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error syncing filter categories:', error);
    return NextResponse.json(
      { error: 'Failed to sync filter categories' },
      { status: 500 }
    );
  }
}