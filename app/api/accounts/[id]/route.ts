import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response-helpers';
import { buildAccountUpdateData } from '@/lib/api/account-helpers';

const updateAccountSchema = z.object({
  primaryEmail: z.string().email().optional(),
  recoveryEmail: z.string().email().optional(),
  recoveryPassword: z.string().min(1).optional(),
  // For dynamic service field updates - single field
  serviceName: z.string().optional(),
  fieldName: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  // For batch service field updates
  serviceUpdates: z
    .array(
      z.object({
        serviceName: z.string(),
        fieldName: z.string(),
        value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
      })
    )
    .optional(),
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

    if (!account) return notFoundResponse('Account not found');

    return successResponse(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return errorResponse('Failed to fetch account');
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
      return validationErrorResponse(validationResult.error);
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) return notFoundResponse('Account not found');

    // Build update data
    const updateData = buildAccountUpdateData(
      validationResult.data,
      existingAccount.status
    );

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        aliases: true,
      },
    });

    revalidatePath('/');

    return successResponse(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    return errorResponse('Failed to update account');
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

    if (!existingAccount) return notFoundResponse('Account not found');

    // Delete account (aliases will be cascade deleted)
    await prisma.account.delete({
      where: { id },
    });

    revalidatePath('/');

    return successResponse({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return errorResponse('Failed to delete account');
  }
}
