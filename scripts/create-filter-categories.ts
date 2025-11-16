import { prisma } from '../lib/prisma';

async function main() {
  console.log('Creating filter categories for existing services...');

  // Get all services
  const services = await prisma.service.findMany();

  for (const service of services) {
    // Check if the service already has a filter category
    const existingCategory = await prisma.filterCategory.findFirst({
      where: { serviceId: service.id },
    });

    if (!existingCategory) {
      // Create a default filter category for this service
      const category = await prisma.filterCategory.create({
        data: {
          name: `${service.name} Filters`,
          serviceId: service.id,
        },
      });

      console.log(
        `✓ Created filter category "${category.name}" for service "${service.name}"`
      );
    } else {
      console.log(
        `✓ Filter category already exists for service "${service.name}"`
      );
    }
  }

  console.log('\nFilter category creation completed!');
}

main()
  .catch((e) => {
    console.error('Error during filter category creation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });