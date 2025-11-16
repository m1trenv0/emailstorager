import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';
import { setServiceField } from '@/lib/service-utils';
import { ServiceFieldValue } from '@/lib/types';

const updateAccountSchema = z.object({
  primaryEmail: z.string().email().optional(),
  recoveryEmail: z.string().email().optional(),
  recoveryPassword: z.string().min(1).optional(),
  // For dynamic service field updates
  serviceName: z.string().optional(),
  fieldName: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

// GET /api/accounts/[id] - Fetch a specific account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        aliases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/[id] - Update an account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = validateInput(updateAccountSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Handle dynamic service field updates
    if (
      validationResult.data.serviceName &&
      validationResult.data.fieldName !== undefined
    ) {
      const currentStatus =
        typeof existingAccount.status === 'object' &&
        existingAccount.status !== null
          ? existingAccount.status
          : {};

      updateData.status = setServiceField(
        currentStatus as Record<string, Record<string, ServiceFieldValue>>,
        validationResult.data.serviceName,
        validationResult.data.fieldName,
        validationResult.data.value ?? null
      );
    }

    // Handle other account field updates
    if (validationResult.data.primaryEmail) {
      updateData.primaryEmail = validationResult.data.primaryEmail;
    }
    if (validationResult.data.recoveryEmail) {
      updateData.recoveryEmail = validationResult.data.recoveryEmail;
    }
    if (validationResult.data.recoveryPassword) {
      updateData.recoveryPassword = validationResult.data.recoveryPassword;
    }

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        aliases: true,
      },
    });

    // Revalidate the main page to show updated account
    revalidatePath('/');

    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Delete account (aliases will be cascade deleted)
    await prisma.account.delete({
      where: { id },
    });

    // Revalidate the main page to remove deleted account
    revalidatePath('/');

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
