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
    console.log(
      `[PATCH /api/accounts/[id]] Starting PATCH request for account ID: ${await params.then((p) => p.id)}`
    );

    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) {
      console.log(`[PATCH /api/accounts/[id]] Rate limited`);
      return rateLimitResult;
    }

    const { id } = await params;
    const body = await request.json();

    console.log(
      `[PATCH /api/accounts/[id]] Received request body for account ${id}:`,
      JSON.stringify(body, null, 2)
    );

    // Validate input
    const validationResult = validateInput(updateAccountSchema, body);
    if (!validationResult.success) {
      console.error(
        `[PATCH /api/accounts/[id]] Validation failed for account ${id}:`,
        validationResult.error
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    console.log(
      `[PATCH /api/accounts/[id]] Validation passed for account ${id}, validated data:`,
      validationResult.data
    );

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      console.error(`[PATCH /api/accounts/[id]] Account not found: ${id}`);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    console.log(
      `[PATCH /api/accounts/[id]] Found existing account ${id}, current status:`,
      JSON.stringify(existingAccount.status, null, 2)
    );

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    let statusUpdated = false;

    // Handle batch service field updates
    if (
      validationResult.data.serviceUpdates &&
      validationResult.data.serviceUpdates.length > 0
    ) {
      console.log(
        `[PATCH /api/accounts/[id]] Processing batch service field updates:`,
        validationResult.data.serviceUpdates
      );

      let currentStatus = (
        typeof existingAccount.status === 'object' &&
        existingAccount.status !== null
          ? existingAccount.status
          : {}
      ) as Record<string, Record<string, ServiceFieldValue>>;

      console.log(
        `[PATCH /api/accounts/[id]] Current status before batch update:`,
        JSON.stringify(currentStatus, null, 2)
      );

      for (const update of validationResult.data.serviceUpdates) {
        console.log(
          `[PATCH /api/accounts/[id]] Applying batch update: service=${update.serviceName}, field=${update.fieldName}, value=${JSON.stringify(update.value)}`
        );
        currentStatus = setServiceField(
          currentStatus as Record<string, Record<string, ServiceFieldValue>>,
          update.serviceName,
          update.fieldName,
          update.value ?? null
        );
      }

      console.log(
        `[PATCH /api/accounts/[id]] Final status after batch updates:`,
        JSON.stringify(currentStatus, null, 2)
      );

      updateData.status = currentStatus;
      statusUpdated = true;
    }

    // Handle single dynamic service field updates (for backward compatibility)
    if (
      !statusUpdated &&
      validationResult.data.serviceName &&
      validationResult.data.fieldName !== undefined
    ) {
      console.log(
        `[PATCH /api/accounts/[id]] Processing single service field update: service=${validationResult.data.serviceName}, field=${validationResult.data.fieldName}, value=${JSON.stringify(validationResult.data.value)}`
      );

      const currentStatus =
        typeof existingAccount.status === 'object' &&
        existingAccount.status !== null
          ? existingAccount.status
          : {};

      console.log(
        `[PATCH /api/accounts/[id]] Current status before update:`,
        JSON.stringify(currentStatus, null, 2)
      );

      const newStatus = setServiceField(
        currentStatus as Record<string, Record<string, ServiceFieldValue>>,
        validationResult.data.serviceName,
        validationResult.data.fieldName,
        validationResult.data.value ?? null
      );

      console.log(
        `[PATCH /api/accounts/[id]] New status after setServiceField:`,
        JSON.stringify(newStatus, null, 2)
      );

      updateData.status = newStatus;
    }

    // Handle other account field updates
    if (validationResult.data.primaryEmail) {
      console.log(
        `[PATCH /api/accounts/[id]] Updating primaryEmail to: ${validationResult.data.primaryEmail}`
      );
      updateData.primaryEmail = validationResult.data.primaryEmail;
    }
    if (validationResult.data.recoveryEmail) {
      console.log(
        `[PATCH /api/accounts/[id]] Updating recoveryEmail to: ${validationResult.data.recoveryEmail}`
      );
      updateData.recoveryEmail = validationResult.data.recoveryEmail;
    }
    if (validationResult.data.recoveryPassword) {
      console.log(`[PATCH /api/accounts/[id]] Updating recoveryPassword`);
      updateData.recoveryPassword = validationResult.data.recoveryPassword;
    }

    console.log(
      `[PATCH /api/accounts/[id]] Final updateData for account ${id}:`,
      JSON.stringify(updateData, null, 2)
    );

    // Update account
    console.log(
      `[PATCH /api/accounts/[id]] Executing prisma.account.update for account ${id}`
    );
    const startTime = Date.now();
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        aliases: true,
      },
    });
    const updateTime = Date.now() - startTime;

    console.log(
      `[PATCH /api/accounts/[id]] Prisma update completed in ${updateTime}ms for account ${id}`
    );
    console.log(
      `[PATCH /api/accounts/[id]] Updated account status:`,
      JSON.stringify(updatedAccount.status, null, 2)
    );

    // Revalidate the main page to show updated account
    revalidatePath('/');

    console.log(
      `[PATCH /api/accounts/[id]] Successfully updated account ${id}, returning response`
    );
    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error) {
    console.error(`[PATCH /api/accounts/[id]] Error updating account:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      accountId: await params.then((p) => p.id).catch(() => 'unknown'),
    });
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
