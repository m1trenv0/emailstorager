import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateInput, rateLimit } from '@/lib/middleware';

const createAliasSchema = z.object({
  email: z.string().email('Invalid email address'),
  comments: z.string().optional(),
});

// GET /api/accounts/[id]/aliases - Fetch all aliases for an account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const aliases = await prisma.alias.findMany({
      where: { accountId: params.id },
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
  { params }: { params: { id: string } }
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

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: {
        aliases: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // ===== BUSINESS LOGIC: 7-DAY LIMIT =====
    if (account.lastAliasAddedAt) {
      const lastAdded = new Date(account.lastAliasAddedAt);
      const now = new Date();
      const daysSinceLastAlias = Math.floor(
        (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastAlias < 7) {
        const daysRemaining = 7 - daysSinceLastAlias;
        const nextAvailable = new Date(lastAdded);
        nextAvailable.setDate(nextAvailable.getDate() + 7);

        return NextResponse.json(
          {
            error: 'Cannot add alias yet',
            message: `You can add a new alias in ${daysRemaining} day(s)`,
            nextAvailableDate: nextAvailable.toISOString(),
            daysRemaining,
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

    // Create new alias and update account's lastAliasAddedAt
    const [alias] = await prisma.$transaction([
      prisma.alias.create({
        data: {
          accountId: params.id,
          email: validationResult.data.email,
          status: {}, // Empty status object initially
          comments: validationResult.data.comments || null,
        },
      }),
      prisma.account.update({
        where: { id: params.id },
        data: {
          lastAliasAddedAt: new Date(),
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
