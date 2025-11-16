import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';
import { ServiceField, ServiceFieldValue } from '@/lib/types';

const addServiceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
});

// POST /api/accounts/[id]/services - Add a service to an account's primary email
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
    const accountId = (await params).id;

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { name: serviceName },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
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

    // Check if service already exists for this account
    if (currentStatus[serviceName]) {
      return NextResponse.json(
        { error: 'Service already exists for this account' },
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

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { status: updatedStatus },
      include: { aliases: true },
    });

    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error) {
    console.error('Error adding service to account:', error);
    return NextResponse.json(
      { error: 'Failed to add service to account' },
      { status: 500 }
    );
  }
}
