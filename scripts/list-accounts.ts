/**
 * List all accounts and their services
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const accounts = await prisma.account.findMany();

  console.log('Accounts in database:\n');

  for (const account of accounts) {
    const status = account.status as any;

    console.log(`Account: ${account.primaryEmail}`);

    if (status['AliExpress']) {
      const ali = status['AliExpress'];
      console.log(`  AliExpress:`);
      console.log(`    TrackNumber: ${ali.TrackNumber || 'Not set'}`);
      console.log(`    isDelivered: ${ali.isDelivered ?? 'Not set'}`);
      console.log(`    trackingStatus: ${ali.trackingStatus || 'Not set'}`);
      console.log(`    lastTrackingUpdate: ${ali.lastTrackingUpdate || 'Not set'}`);
    }

    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
