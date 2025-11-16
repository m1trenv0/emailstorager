import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

// Validation schema for creating an account
const createAccountSchema = z.object({
  primaryEmail: z.string().email('Invalid email address'),
  recoveryEmail: z.string().email('Invalid recovery email address'),
  recoveryPassword: z.string().min(1, 'Recovery password is required'),
});

// GET /api/accounts - Fetch all accounts with their aliases
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const accounts = await prisma.account.findMany({
      include: {
        aliases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accounts, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(createAccountSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { primaryEmail, recoveryEmail, recoveryPassword } =
      validationResult.data;

    // Check if account with this primary email already exists
    const existingAccount = await prisma.account.findFirst({
      where: { primaryEmail },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new account
    const account = await prisma.account.create({
      data: {
        primaryEmail,
        recoveryEmail,
        recoveryPassword,
      },
      include: {
        aliases: true,
      },
    });

    // Revalidate the main page to show new account
    revalidatePath('/');

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
