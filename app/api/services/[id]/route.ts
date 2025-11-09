import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';
import { ServiceField } from '@/lib/types';

// Validation schema for ServiceField
const serviceFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['string', 'date', 'boolean', 'number']),
  required: z.boolean(),
  dependsOn: z.array(z.string()).optional(),
  description: z.string().optional(),
  defaultValue: z
    .union([z.string(), z.number(), z.boolean(), z.null()])
    .optional(),
});

// Validation schema for updating a service
const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').optional(),
  description: z.string().optional(),
  fields: z
    .array(serviceFieldSchema)
    .min(1, 'At least one field is required')
    .optional(),
});

// GET /api/services/[id] - Fetch a single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        filterCategories: {
          include: {
            filters: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Update a service
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
    const validationResult = validateInput(updateServiceSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, description, fields } = validationResult.data;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // If name is being changed, check for duplicates
    if (name && name !== existingService.name) {
      const duplicateService = await prisma.service.findUnique({
        where: { name },
      });

      if (duplicateService) {
        return NextResponse.json(
          { error: 'Service with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate field dependencies if fields are provided
    if (fields) {
      const fieldNames = fields.map((f: ServiceField) => f.name);
      for (const field of fields) {
        if (field.dependsOn) {
          for (const dep of field.dependsOn) {
            if (!fieldNames.includes(dep)) {
              return NextResponse.json(
                {
                  error: `Field "${field.name}" depends on non-existent field "${dep}"`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(fields && { fields: JSON.parse(JSON.stringify(fields)) }),
      },
      include: {
        filterCategories: {
          include: {
            filters: true,
          },
        },
      },
    });

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Delete service (cascade will delete related filter categories and filters)
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
