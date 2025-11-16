/**
 * Migration script to add tracking fields to existing AliExpress service
 * Run this with: npx tsx scripts/migrate-aliexpress-tracking.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Starting AliExpress service migration...');

  // Find AliExpress service
  const aliexpress = await prisma.service.findUnique({
    where: { name: 'AliExpress' },
  });

  if (!aliexpress) {
    console.log('AliExpress service not found. Skipping migration.');
    return;
  }

  console.log('Found AliExpress service:', aliexpress.id);

  const currentFields = aliexpress.fields as any[];

  // Check if tracking fields already exist
  const hasTrackingStatus = currentFields.some(
    (f) => f.name === 'trackingStatus'
  );
  const hasLastTrackingUpdate = currentFields.some(
    (f) => f.name === 'lastTrackingUpdate'
  );

  if (hasTrackingStatus && hasLastTrackingUpdate) {
    console.log('Tracking fields already exist. No migration needed.');
    return;
  }

  // Add missing tracking fields
  const updatedFields = [...currentFields];

  if (!hasTrackingStatus) {
    console.log('Adding trackingStatus field...');
    updatedFields.push({
      name: 'trackingStatus',
      type: 'string',
      required: false,
      description: 'Current tracking status from 17TRACK API',
    });
  }

  if (!hasLastTrackingUpdate) {
    console.log('Adding lastTrackingUpdate field...');
    updatedFields.push({
      name: 'lastTrackingUpdate',
      type: 'string',
      required: false,
      description: 'Last time tracking was updated (ISO date string)',
    });
  }

  // Update service with new fields
  await prisma.service.update({
    where: { id: aliexpress.id },
    data: {
      fields: updatedFields,
    },
  });

  console.log('✅ AliExpress service updated successfully!');
  console.log('Added fields:');
  if (!hasTrackingStatus) console.log('  - trackingStatus');
  if (!hasLastTrackingUpdate) console.log('  - lastTrackingUpdate');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
