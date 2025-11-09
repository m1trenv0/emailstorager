import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

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

    // Check if alias exists
    const existingAlias = await prisma.alias.findUnique({
      where: { id: (await params).id },
    });

    if (!existingAlias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (validationResult.data.status) {
      // Merge existing status with new status
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
