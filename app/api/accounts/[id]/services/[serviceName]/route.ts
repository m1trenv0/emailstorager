import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/middleware';
import { ServiceFieldValue } from '@/lib/types';

// DELETE /api/accounts/[id]/services/[serviceName] - Remove a service from an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceName: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id: accountId, serviceName } = await params;

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Get current status
    const currentStatus =
      typeof existingAccount.status === 'object' &&
      existingAccount.status !== null
        ? (existingAccount.status as Record<
            string,
            Record<string, ServiceFieldValue>
          >)
        : {};

    // Check if service exists for this account
    if (!currentStatus[serviceName]) {
      return NextResponse.json(
        { error: 'Service not found for this account' },
        { status: 404 }
      );
    }

    // Remove service from status
    const updatedStatus = { ...currentStatus };
    delete updatedStatus[serviceName];

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { status: updatedStatus },
      include: { aliases: true },
    });

    // Note: revalidatePath removed - client-side state handles updates for better performance

    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error) {
    console.error('Error removing service from account:', error);
    return NextResponse.json(
      { error: 'Failed to remove service from account' },
      { status: 500 }
    );
  }
}
