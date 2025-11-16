import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

// Special pseudo-field for service registration status
const SERVICE_REGISTRATION_FIELD = '__service_registered__';

// Validation schema for filter condition
const filterConditionSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  operator: z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'gt',
    'gte',
    'lt',
    'lte',
    'exists',
    'not_exists',
  ]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

// Validation schema for creating a filter
const filterSchema = z.object({
  name: z.string().min(1, 'Filter name is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  conditions: z
    .array(filterConditionSchema)
    .min(1, 'At least one condition is required'),
  showAsTab: z.boolean().optional().default(false),
  tabOrder: z.number().optional().default(0),
});

// GET /api/filters - Fetch all filters
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId } : {};

    const filters = await prisma.filter.findMany({
      where,
      include: {
        category: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(filters, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

// POST /api/filters - Create a new filter
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(filterSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, categoryId, conditions, showAsTab, tabOrder } =
      validationResult.data;

    // Check if category exists
    const category = await prisma.filterCategory.findUnique({
      where: { id: categoryId },
      include: {
        service: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Filter category not found' },
        { status: 404 }
      );
    }

    // Validate that condition fields exist in the service definition
    const serviceFields = category.service.fields as Array<{ name: string }>;
    const serviceFieldNames = serviceFields.map((f) => f.name);

    for (const condition of conditions) {
      // Allow the special service registration field
      if (condition.field === SERVICE_REGISTRATION_FIELD) {
        // Validate that only exists/not_exists operators are used
        if (
          condition.operator !== 'exists' &&
          condition.operator !== 'not_exists'
        ) {
          return NextResponse.json(
            {
              error: `Service Registration Status field only supports "exists" or "not_exists" operators`,
            },
            { status: 400 }
          );
        }
        continue;
      }

      if (!serviceFieldNames.includes(condition.field)) {
        return NextResponse.json(
          {
            error: `Field "${condition.field}" does not exist in service "${category.service.name}"`,
          },
          { status: 400 }
        );
      }

      // Validate that value is provided for operators that need it
      const operatorsNeedingValue = [
        'equals',
        'not_equals',
        'contains',
        'not_contains',
        'gt',
        'gte',
        'lt',
        'lte',
      ];
      if (
        operatorsNeedingValue.includes(condition.operator) &&
        condition.value === undefined
      ) {
        return NextResponse.json(
          {
            error: `Operator "${condition.operator}" requires a value`,
          },
          { status: 400 }
        );
      }
    }

    // Create new filter
    const filter = await prisma.filter.create({
      data: {
        name,
        categoryId,
        conditions: JSON.parse(JSON.stringify(conditions)),
        showAsTab: showAsTab ?? false,
        tabOrder: tabOrder ?? 0,
      },
      include: {
        category: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(filter, { status: 201 });
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    );
  }
}
