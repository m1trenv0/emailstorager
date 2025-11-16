/**
 * Update specific track number with carrier
 * Usage: npx tsx scripts/update-track.ts <trackNumber> [carrier]
 * Carriers: 2061=Bpost, 1373=China Post, etc.
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { getTrackingInfo } from '../lib/tracking/17track';

async function main() {
  const trackNumber = process.argv[2];
  const carrier = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  if (!trackNumber) {
    console.error('Usage: npx tsx scripts/update-track.ts <trackNumber> [carrier]');
    console.error('Example: npx tsx scripts/update-track.ts LB73247289BE 2061');
    console.error('\nCommon carriers:');
    console.error('  2061 = Bpost (Belgium)');
    console.error('  1373 = China Post');
    console.error('  1004 = DHL');
    process.exit(1);
  }

  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.error('❌ TRACK17_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log(`\n📦 Updating track number: ${trackNumber}`);
  if (carrier) {
    console.log(`🚚 Using carrier code: ${carrier}`);
  }
  console.log('');

  try {
    const trackingInfo = await getTrackingInfo(trackNumber, apiKey, carrier);

    if (!trackingInfo) {
      console.log('❌ No tracking data available');
      console.log('\nTry with carrier code:');
      console.log('  npx tsx scripts/update-track.ts', trackNumber, '2061');
      return;
    }

    console.log('✅ Tracking information retrieved!\n');
    console.log('═'.repeat(50));
    console.log('Carrier:', trackingInfo.carrier);
    console.log('Status:', trackingInfo.status);
    console.log('Delivered:', trackingInfo.isDelivered ? 'YES ✅' : 'NO ❌');
    console.log('Events:', trackingInfo.events.length);
    console.log('═'.repeat(50));
    console.log('');

    // Update cache
    await prisma.trackingCache.upsert({
      where: { trackNumber },
      update: {
        trackingData: trackingInfo as any,
        isDelivered: trackingInfo.isDelivered,
        lastUpdated: new Date(),
      },
      create: {
        trackNumber,
        serviceName: 'AliExpress',
        trackingData: trackingInfo as any,
        isDelivered: trackingInfo.isDelivered,
      },
    });

    console.log('💾 Cache updated');

    // Find and update aliases with this track number
    const aliases = await prisma.alias.findMany();

    let aliasUpdated = 0;

    for (const alias of aliases) {
      const status = alias.status as any;
      if (status['AliExpress']?.TrackNumber === trackNumber) {
        status['AliExpress'] = {
          ...status['AliExpress'],
          isDelivered: trackingInfo.isDelivered,
          trackingStatus: trackingInfo.status,
          lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
        };

        await prisma.alias.update({
          where: { id: alias.id },
          data: { status },
        });

        console.log(`💾 Updated alias: ${alias.email}`);
        aliasUpdated++;
      }
    }

    console.log('');
    console.log(`✅ Successfully updated ${aliasUpdated} alias(es)`);
    console.log('');
    console.log('Latest events:');
    console.log('─'.repeat(50));
    trackingInfo.events.slice(0, 3).forEach((event, i) => {
      console.log(`${i + 1}. [${event.time}]`);
      console.log(`   ${event.description}`);
      if (event.location) {
        console.log(`   Location: ${event.location}`);
      }
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
