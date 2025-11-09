import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

// Validation schema for creating a filter category
const filterCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
});

// GET /api/filter-categories - Fetch all filter categories
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const where = serviceId ? { serviceId } : {};

    const categories = await prisma.filterCategory.findMany({
      where,
      include: {
        filters: true,
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching filter categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter categories' },
      { status: 500 }
    );
  }
}

// POST /api/filter-categories - Create a new filter category
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(filterCategorySchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, serviceId } = validationResult.data;

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create new filter category
    const category = await prisma.filterCategory.create({
      data: {
        name,
        serviceId,
      },
      include: {
        filters: true,
        service: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating filter category:', error);
    return NextResponse.json(
      { error: 'Failed to create filter category' },
      { status: 500 }
    );
  }
}
