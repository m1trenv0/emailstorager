import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';
import { ServiceField, ServiceFieldValue } from '@/lib/types';

const addServiceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
});

// POST /api/aliases/[id]/services - Add a service to an alias
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(addServiceSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { serviceName } = validationResult.data;
    const aliasId = (await params).id;

    // Check if alias exists
    const existingAlias = await prisma.alias.findUnique({
      where: { id: aliasId },
    });

    if (!existingAlias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { name: serviceName },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get current status
    const currentStatus =
      typeof existingAlias.status === 'object' && existingAlias.status !== null
        ? (existingAlias.status as Record<
            string,
            Record<string, ServiceFieldValue>
          >)
        : {};

    // Check if service already exists for this alias
    if (currentStatus[serviceName]) {
      return NextResponse.json(
        { error: 'Service already exists for this alias' },
        { status: 409 }
      );
    }

    // Initialize service fields with default values
    const fields = service.fields as unknown as ServiceField[];
    const initialServiceStatus: Record<string, ServiceFieldValue> = {};

    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        initialServiceStatus[field.name] = field.defaultValue;
      } else {
        initialServiceStatus[field.name] = null;
      }
    }

    // Add service to status
    const updatedStatus = {
      ...currentStatus,
      [serviceName]: initialServiceStatus,
    };

    // Update alias
    const updatedAlias = await prisma.alias.update({
      where: { id: aliasId },
      data: { status: updatedStatus },
    });

    // Note: revalidatePath removed - client-side state handles updates for better performance

    return NextResponse.json(updatedAlias, { status: 200 });
  } catch (error) {
    console.error('Error adding service to alias:', error);
    return NextResponse.json(
      { error: 'Failed to add service to alias' },
      { status: 500 }
    );
  }
}
