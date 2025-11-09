import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

const createAliasSchema = z.object({
  email: z.string().email('Invalid email address'),
  comments: z.string().optional(),
  countsTowardLimit: z.boolean().optional().default(true),
});

// GET /api/accounts/[id]/aliases - Fetch all aliases for an account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await params;

    const aliases = await prisma.alias.findMany({
      where: { accountId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(aliases, { status: 200 });
  } catch (error) {
    console.error('Error fetching aliases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aliases' },
      { status: 500 }
    );
  }
}

// POST /api/accounts/[id]/aliases - Create a new alias (with 7-day limit)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    // Validate input
    const validationResult = validateInput(createAliasSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        aliases: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // ===== BUSINESS LOGIC: 2 ALIASES PER 7-DAY PERIOD =====
    const countsTowardLimit = validationResult.data.countsTowardLimit ?? true;

    if (countsTowardLimit) {
      // Check if we need to reset the counter (7 days have passed)
      let currentAliasCount = account.aliasesAddedInPeriod;

      if (account.lastAliasAddedAt) {
        const lastAdded = new Date(account.lastAliasAddedAt);
        const now = new Date();
        const daysSinceLastAlias = Math.floor(
          (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Reset counter if 7 days have passed
        if (daysSinceLastAlias >= 7) {
          currentAliasCount = 0;
        }
      }

      // Check if we've reached the limit (2 aliases per 7 days)
      if (currentAliasCount >= 2) {
        const lastAdded = new Date(account.lastAliasAddedAt!);
        const daysRemaining =
          7 -
          Math.floor(
            (new Date().getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
          );
        const nextAvailable = new Date(lastAdded);
        nextAvailable.setDate(nextAvailable.getDate() + 7);

        return NextResponse.json(
          {
            error: 'Cannot add alias yet',
            message: `You can add a new alias in ${daysRemaining} day(s) (2 aliases per 7 days limit reached)`,
            nextAvailableDate: nextAvailable.toISOString(),
            daysRemaining,
            aliasesUsed: currentAliasCount,
            aliasesLimit: 2,
          },
          { status: 429 }
        );
      }
    }

    // Check if alias email already exists for this account
    const existingAlias = account.aliases.find(
      (alias) => alias.email === validationResult.data.email
    );

    if (existingAlias) {
      return NextResponse.json(
        { error: 'Alias with this email already exists for this account' },
        { status: 409 }
      );
    }

    // Create new alias and update account's lastAliasAddedAt and counter
    const shouldUpdateCounter = countsTowardLimit;

    // Calculate new counter value
    let newAliasCount = account.aliasesAddedInPeriod;
    if (shouldUpdateCounter) {
      if (account.lastAliasAddedAt) {
        const daysSinceLastAlias = Math.floor(
          (new Date().getTime() -
            new Date(account.lastAliasAddedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        // Reset counter if 7 days have passed
        newAliasCount =
          daysSinceLastAlias >= 7 ? 1 : account.aliasesAddedInPeriod + 1;
      } else {
        newAliasCount = 1;
      }
    }

    const [alias] = await prisma.$transaction([
      prisma.alias.create({
        data: {
          accountId: id,
          email: validationResult.data.email,
          status: {}, // Empty status object initially
          comments: validationResult.data.comments || null,
          countsTowardLimit: countsTowardLimit,
        },
      }),
      prisma.account.update({
        where: { id },
        data: {
          lastAliasAddedAt: shouldUpdateCounter
            ? new Date()
            : account.lastAliasAddedAt,
          aliasesAddedInPeriod: newAliasCount,
        },
      }),
    ]);

    return NextResponse.json(alias, { status: 201 });
  } catch (error) {
    console.error('Error creating alias:', error);
    return NextResponse.json(
      { error: 'Failed to create alias' },
      { status: 500 }
    );
  }
}
