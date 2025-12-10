/**
 * List all aliases and their services
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const aliases = await prisma.alias.findMany({
    include: {
      account: true,
    },
  });

  console.log('Aliases in database:\n');

  for (const alias of aliases) {
    const status = alias.status as any;

    console.log(`Alias ID: ${alias.id}`);
    console.log(`Email: ${alias.email}`);
    console.log(`Account: ${alias.account.primaryEmail}`);
    console.log(`Comments: ${alias.comments || 'None'}`);

    if (status && typeof status === 'object') {
      for (const [serviceName, serviceData] of Object.entries(status)) {
        console.log(`  ${serviceName}:`);
        if (serviceData && typeof serviceData === 'object') {
          for (const [field, value] of Object.entries(serviceData)) {
            console.log(`    ${field}: ${value}`);
          }
        }
      }
    }

    console.log('');
  }

  console.log(`Total aliases: ${aliases.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
