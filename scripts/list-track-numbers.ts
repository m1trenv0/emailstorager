/**
 * List all track numbers in the database
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const aliases = await prisma.alias.findMany();

  console.log('Track numbers in database:\n');

  for (const alias of aliases) {
    const status = alias.status as any;

    console.log(`Alias: ${alias.email}`);

    if (status['AliExpress']) {
      const ali = status['AliExpress'];
      console.log(`  AliExpress:`);
      console.log(`    TrackNumber: ${ali.TrackNumber || 'Not set'}`);
      console.log(`    isDelivered: ${ali.isDelivered ?? 'Not set'}`);
      console.log(`    trackingStatus: ${ali.trackingStatus || 'Not set'}`);
      console.log(
        `    lastTrackingUpdate: ${ali.lastTrackingUpdate || 'Not set'}`
      );
    }

    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
