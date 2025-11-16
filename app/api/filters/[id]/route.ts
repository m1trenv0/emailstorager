import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

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

// Validation schema for updating a filter
const updateFilterSchema = z.object({
  name: z.string().min(1, 'Filter name is required').optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  conditions: z
    .array(filterConditionSchema)
    .min(1, 'At least one condition is required')
    .optional(),
  showAsTab: z.boolean().optional(),
  tabOrder: z.number().optional(),
});

// GET /api/filters/[id] - Fetch a single filter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;

    const filter = await prisma.filter.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!filter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }

    return NextResponse.json(filter, { status: 200 });
  } catch (error) {
    console.error('Error fetching filter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter' },
      { status: 500 }
    );
  }
}

// PUT /api/filters/[id] - Update a filter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = validateInput(updateFilterSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, categoryId, conditions, showAsTab, tabOrder } =
      validationResult.data;

    // Check if filter exists
    const existingFilter = await prisma.filter.findUnique({
      where: { id },
    });

    if (!existingFilter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }

    // If category is being changed, validate it exists and get service info
    let category;
    if (categoryId && categoryId !== existingFilter.categoryId) {
      category = await prisma.filterCategory.findUnique({
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
    } else if (conditions) {
      // If only conditions are being updated, get current category
      category = await prisma.filterCategory.findUnique({
        where: { id: existingFilter.categoryId },
        include: {
          service: true,
        },
      });
    }

    // Validate conditions if provided
    if (conditions && category) {
      const serviceFields = category.service.fields as Array<{ name: string }>;
      const serviceFieldNames = serviceFields.map((f) => f.name);

      for (const condition of conditions) {
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
    }

    // Update filter
    const updatedFilter = await prisma.filter.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(conditions && {
          conditions: JSON.parse(JSON.stringify(conditions)),
        }),
        ...(showAsTab !== undefined && { showAsTab }),
        ...(tabOrder !== undefined && { tabOrder }),
      },
      include: {
        category: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFilter, { status: 200 });
  } catch (error) {
    console.error('Error updating filter:', error);
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    );
  }
}

// DELETE /api/filters/[id] - Delete a filter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;

    // Check if filter exists
    const existingFilter = await prisma.filter.findUnique({
      where: { id },
    });

    if (!existingFilter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }

    // Delete filter
    await prisma.filter.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Filter deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}
