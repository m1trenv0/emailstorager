/**
 * Cron job script to update all tracking numbers periodically
 * Run this with: npx tsx scripts/cron-tracking-update.ts
 *
 * Set up cron job (every 6 hours):
 * 0 *\/6 * * * cd /path/to/project && npx tsx scripts/cron-tracking-update.ts
 */

import 'dotenv/config';
import { updateAllTrackingForService } from '../lib/tracking/trackingService';

async function main() {
  console.log(`[${new Date().toISOString()}] Starting cron tracking update...`);

  try {
    const result = await updateAllTrackingForService('AliExpress');

    console.log(
      `[${new Date().toISOString()}] Cron tracking update completed:`
    );
    console.log(`  ✅ Updated: ${result.updated}`);
    console.log(`  ❌ Failed: ${result.failed}`);

    if (result.updated > 0 || result.failed > 0) {
      console.log(`  📊 Total processed: ${result.updated + result.failed}`);
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cron tracking update failed:`,
      error
    );
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
