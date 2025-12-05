/**
 * Test script for tracking API
 * Run this with: npx tsx scripts/test-tracking.ts <trackNumber>
 */

import 'dotenv/config';
import { getTrackingInfo } from '../lib/tracking/17track';

async function main() {
  const trackNumber = process.argv[2];
  const carrierArg = process.argv[3];
  const carrier = carrierArg ? parseInt(carrierArg) : undefined;

  if (!trackNumber) {
    console.error('Usage: npx tsx scripts/test-tracking.ts <trackNumber> [carrierCode]');
    console.error('Example: npx tsx scripts/test-tracking.ts LB73247289BE 3011');
    process.exit(1);
  }

  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.error('ERROR: TRACK17_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('Testing 17TRACK API...');
  console.log('Track Number:', trackNumber);
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('');

  try {
    const trackingInfo = await getTrackingInfo(trackNumber, apiKey, carrier);

    if (!trackingInfo) {
      console.log('❌ No tracking information found');
      console.log('');
      console.log('Possible reasons:');
      console.log('1. Track number is invalid');
      console.log('2. Package is not yet in the system');
      console.log('3. API key is invalid');
      console.log('4. Rate limit exceeded');
      return;
    }

    console.log('✅ Tracking information retrieved successfully!');
    console.log(JSON.stringify(trackingInfo, null, 2));
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('Track Number:', trackingInfo.trackNumber);
    console.log('Carrier:', trackingInfo.carrier);
    console.log('Status:', trackingInfo.status);
    console.log('Is Delivered:', trackingInfo.isDelivered ? 'YES ✅' : 'NO ❌');
    console.log('Last Update:', trackingInfo.lastUpdate.toISOString());
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Events:');
    console.log('───────────────────────────────────────────');

    if (trackingInfo.events.length === 0) {
      console.log('No events found');
    } else {
      trackingInfo.events.forEach((event, index) => {
        console.log(`${index + 1}. [${event.time}]`);
        console.log(`   Status: ${event.status}`);
        console.log(`   Description: ${event.description}`);
        if (event.location) {
          console.log(`   Location: ${event.location}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error fetching tracking info:', error);
  }
}

main();
