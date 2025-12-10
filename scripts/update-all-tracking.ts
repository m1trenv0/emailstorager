/**
 * Manual script to update all tracking numbers NOW
 * Run this with: npx tsx scripts/update-all-tracking.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { getTrackingInfo } from '../lib/tracking/17track';

async function main() {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.error('❌ TRACK17_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log(
    '🔍 Finding all aliases and accounts with AliExpress track numbers...\n'
  );

  const toUpdate: Array<{
    id: string;
    type: 'alias' | 'account';
    email: string;
    trackNumber: string;
  }> = [];

  // Find all aliases
  const aliases = await prisma.alias.findMany();
  for (const alias of aliases) {
    const status = alias.status as any;
    const aliexpressStatus = status['AliExpress'];

    if (aliexpressStatus?.TrackNumber) {
      toUpdate.push({
        id: alias.id,
        type: 'alias',
        email: alias.email,
        trackNumber: aliexpressStatus.TrackNumber,
      });
    }
  }

  // Find all accounts
  const accounts = await prisma.account.findMany();
  for (const account of accounts) {
    const status = account.status as any;
    const aliexpressStatus = status['AliExpress'];

    if (aliexpressStatus?.TrackNumber) {
      toUpdate.push({
        id: account.id,
        type: 'account',
        email: account.primaryEmail,
        trackNumber: aliexpressStatus.TrackNumber,
      });
    }
  }

  console.log(
    `Found ${toUpdate.length} aliases/accounts with track numbers:\n`
  );
  toUpdate.forEach((item, index) => {
    console.log(`${index + 1}. ${item.email} - ${item.trackNumber}`);
  });

  if (toUpdate.length === 0) {
    console.log('\n✅ No track numbers to update');
    return;
  }

  console.log('\n' + '═'.repeat(50));
  console.log('Starting tracking updates...');
  console.log('═'.repeat(50) + '\n');

  let updated = 0;
  let failed = 0;
  let noData = 0;

  for (const item of toUpdate) {
    console.log(`\n📦 Processing: ${item.email}`);
    console.log(`   Track#: ${item.trackNumber}`);

    try {
      // Get tracking info
      const trackingInfo = await getTrackingInfo(item.trackNumber, apiKey);

      if (!trackingInfo) {
        console.log(`   ❌ Package not found or tracking error`);
        noData++;

        // Update status with error for not found packages
        if (item.type === 'alias') {
          const alias = await prisma.alias.findUnique({
            where: { id: item.id },
          });

          if (alias) {
            const status = alias.status as any;
            if (status['AliExpress']) {
              status['AliExpress'] = {
                ...status['AliExpress'],
                isDelivered: false,
                trackingStatus: 'Not Found',
                trackingError: 'Package not found',
                lastTrackingUpdate: new Date().toISOString(),
              };

              await prisma.alias.update({
                where: { id: item.id },
                data: { status },
              });

              console.log(`   💾 Database updated with error status`);
            }
          }
        } else {
          const account = await prisma.account.findUnique({
            where: { id: item.id },
          });

          if (account) {
            const status = account.status as any;
            if (status['AliExpress']) {
              status['AliExpress'] = {
                ...status['AliExpress'],
                isDelivered: false,
                trackingStatus: 'Not Found',
                trackingError: 'Package not found',
                lastTrackingUpdate: new Date().toISOString(),
              };

              await prisma.account.update({
                where: { id: item.id },
                data: { status },
              });

              console.log(`   💾 Database updated with error status`);
            }
          }
        }

        continue;
      }

      console.log(`   ✅ Carrier: ${trackingInfo.carrier}`);
      console.log(`   📍 Status: ${trackingInfo.status}`);
      console.log(
        `   📦 Delivered: ${trackingInfo.isDelivered ? 'YES' : 'NO'}`
      );
      console.log(`   🕐 Events: ${trackingInfo.events.length}`);

      // Update cache
      await prisma.trackingCache.upsert({
        where: { trackNumber: item.trackNumber },
        update: {
          trackingData: trackingInfo as any,
          isDelivered: trackingInfo.isDelivered,
          lastUpdated: new Date(),
        },
        create: {
          trackNumber: item.trackNumber,
          serviceName: 'AliExpress',
          trackingData: trackingInfo as any,
          isDelivered: trackingInfo.isDelivered,
        },
      });

      // Update alias or account
      if (item.type === 'alias') {
        const alias = await prisma.alias.findUnique({
          where: { id: item.id },
        });

        if (alias) {
          const status = alias.status as any;
          if (status['AliExpress']) {
            status['AliExpress'] = {
              ...status['AliExpress'],
              isDelivered: trackingInfo.isDelivered,
              trackingStatus: trackingInfo.status,
              lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
            };

            await prisma.alias.update({
              where: { id: item.id },
              data: { status },
            });

            console.log(`   💾 Database updated successfully`);
            updated++;
          }
        }
      } else {
        const account = await prisma.account.findUnique({
          where: { id: item.id },
        });

        if (account) {
          const status = account.status as any;
          if (status['AliExpress']) {
            status['AliExpress'] = {
              ...status['AliExpress'],
              isDelivered: trackingInfo.isDelivered,
              trackingStatus: trackingInfo.status,
              lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
            };

            await prisma.account.update({
              where: { id: item.id },
              data: { status },
            });

            console.log(`   💾 Database updated successfully`);
            updated++;
          }
        }
      }

      // Wait between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`   ❌ Error:`, error.message);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('Update Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`⚠️  No data available: ${noData}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total processed: ${toUpdate.length}`);
  console.log('═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
