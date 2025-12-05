import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit, csrfProtection } from '@/lib/middleware';
import { setServiceField } from '@/lib/service-utils';
import { ServiceFieldValue } from '@/lib/types';

const updateAliasSchema = z.object({
  status: z
    .object({
      aliexpress: z
        .enum(['registered', 'banned', 'delivered', 'pending'])
        .optional(),
      augment: z
        .enum(['registered', 'banned', 'delivered', 'pending'])
        .optional(),
    })
    .optional(),
  comments: z.string().optional(),
  // New format for dynamic service field updates
  serviceName: z.string().optional(),
  fieldName: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

// GET /api/aliases/[id] - Fetch a specific alias
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const alias = await prisma.alias.findUnique({
      where: { id: (await params).id },
      include: {
        account: true,
      },
    });

    if (!alias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    return NextResponse.json(alias, { status: 200 });
  } catch (error) {
    console.error('Error fetching alias:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alias' },
      { status: 500 }
    );
  }
}

// PATCH /api/aliases/[id] - Update alias status or comments
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply CSRF protection
    // const csrfResult = csrfProtection(request);
    // if (csrfResult) return csrfResult;

    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(updateAliasSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const aliasId = (await params).id;
    console.log('[PATCH /api/aliases/[id]] Received alias ID:', aliasId);

    // Check if alias exists
    const existingAlias = await prisma.alias.findUnique({
      where: { id: aliasId },
    });

    console.log('[PATCH /api/aliases/[id]] Alias found:', !!existingAlias);

    if (!existingAlias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Handle dynamic service field updates
    if (validationResult.data.serviceName && validationResult.data.fieldName !== undefined) {
      const currentStatus =
        typeof existingAlias.status === 'object' &&
        existingAlias.status !== null
          ? existingAlias.status
          : {};

      updateData.status = setServiceField(
        currentStatus as Record<string, Record<string, ServiceFieldValue>>,
        validationResult.data.serviceName,
        validationResult.data.fieldName,
        validationResult.data.value ?? null
      );
    } else if (validationResult.data.status) {
      // Legacy format - merge existing status with new status
      const currentStatus =
        typeof existingAlias.status === 'object' &&
        existingAlias.status !== null
          ? existingAlias.status
          : {};

      updateData.status = {
        ...currentStatus,
        ...validationResult.data.status,
      };
    }

    if (validationResult.data.comments !== undefined) {
      updateData.comments = validationResult.data.comments;
    }

    // Update alias
    const updatedAlias = await prisma.alias.update({
      where: { id: (await params).id },
      data: updateData,
    });

    // Note: revalidatePath removed for PATCH - client-side state handles updates for better performance

    return NextResponse.json(updatedAlias, { status: 200 });
  } catch (error) {
    console.error('Error updating alias:', error);
    return NextResponse.json(
      { error: 'Failed to update alias' },
      { status: 500 }
    );
  }
}

// DELETE /api/aliases/[id] - Delete an alias
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply CSRF protection
    const csrfResult = csrfProtection(request);
    if (csrfResult) return csrfResult;

    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    // Check if alias exists
    const existingAlias = await prisma.alias.findUnique({
      where: { id: (await params).id },
    });

    if (!existingAlias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Delete alias
    await prisma.alias.delete({
      where: { id: (await params).id },
    });

    // Revalidate the main page to remove deleted alias
    revalidatePath('/');

    return NextResponse.json(
      { message: 'Alias deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting alias:', error);
    return NextResponse.json(
      { error: 'Failed to delete alias' },
      { status: 500 }
    );
  }
}
