import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/check-setup
 * Check if setup is required (no users exist)
 */
export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      setupRequired: userCount === 0,
    });
  } catch (error) {
    console.error('Check setup error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
