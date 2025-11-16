import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import {
  updateAllTrackingForService,
  getOrUpdateTracking,
} from '@/lib/tracking/trackingService';

/**
 * POST /api/tracking/update
 * Manually trigger tracking update for all packages or a specific track number
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trackNumber, serviceName = 'AliExpress' } = body;

    // If trackNumber is provided, update only that one
    if (trackNumber) {
      const trackingInfo = await getOrUpdateTracking(trackNumber, serviceName);

      if (!trackingInfo) {
        return NextResponse.json(
          { error: 'Failed to fetch tracking information' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        tracking: trackingInfo,
      });
    }

    // Otherwise, update all tracking for the service
    const result = await updateAllTrackingForService(serviceName);

    return NextResponse.json({
      success: true,
      updated: result.updated,
      failed: result.failed,
      message: `Updated ${result.updated} packages, ${result.failed} failed`,
    });
  } catch (error) {
    console.error('Tracking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking information' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tracking/update
 * Get tracking information for a specific track number
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const trackNumber = searchParams.get('trackNumber');

    if (!trackNumber) {
      return NextResponse.json(
        { error: 'trackNumber is required' },
        { status: 400 }
      );
    }

    const serviceName = searchParams.get('serviceName') || 'AliExpress';
    const trackingInfo = await getOrUpdateTracking(trackNumber, serviceName);

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking: trackingInfo,
    });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}
