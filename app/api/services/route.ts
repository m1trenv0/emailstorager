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

// Validation schema for creating/updating a service
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  fields: z.array(serviceFieldSchema).min(1, 'At least one field is required'),
});

// GET /api/services - Fetch all services
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const services = await prisma.service.findMany({
      include: {
        filterCategories: {
          include: {
            filters: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(services, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(serviceSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, description, fields } = validationResult.data;

    // Check if service with this name already exists
    const existingService = await prisma.service.findUnique({
      where: { name },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 409 }
      );
    }

    // Validate field dependencies
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

    // Create new service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        fields: JSON.parse(JSON.stringify(fields)),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
