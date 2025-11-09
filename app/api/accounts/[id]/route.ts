import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

const updateAccountSchema = z.object({
  primaryEmail: z.string().email().optional(),
  recoveryEmail: z.string().email().optional(),
  recoveryPassword: z.string().min(1).optional(),
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

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: validationResult.data,
      include: {
        aliases: true,
      },
    });

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
