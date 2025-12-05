import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/middleware';
import { ServiceFieldValue } from '@/lib/types';

// DELETE /api/aliases/[id]/services/[serviceName] - Remove a service from an alias
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceName: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id: aliasId, serviceName } = await params;

    // Check if alias exists
    const existingAlias = await prisma.alias.findUnique({
      where: { id: aliasId },
    });

    if (!existingAlias) {
      return NextResponse.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Get current status
    const currentStatus =
      typeof existingAlias.status === 'object' && existingAlias.status !== null
        ? (existingAlias.status as Record<
            string,
            Record<string, ServiceFieldValue>
          >)
        : {};

    // Check if service exists for this alias
    if (!currentStatus[serviceName]) {
      return NextResponse.json(
        { error: 'Service not found for this alias' },
        { status: 404 }
      );
    }

    // Remove service from status
    const updatedStatus = { ...currentStatus };
    delete updatedStatus[serviceName];

    // Update alias
    const updatedAlias = await prisma.alias.update({
      where: { id: aliasId },
      data: { status: updatedStatus },
    });

    // Note: revalidatePath removed - client-side state handles updates for better performance

    return NextResponse.json(updatedAlias, { status: 200 });
  } catch (error) {
    console.error('Error removing service from alias:', error);
    return NextResponse.json(
      { error: 'Failed to remove service from alias' },
      { status: 500 }
    );
  }
}
