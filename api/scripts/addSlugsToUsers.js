// scripts/addSlugsToUsers.js
import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugGenerator.js';

const prisma = new PrismaClient();

async function addSlugsToUsers() {
  try {
    console.log('Starting migration to add slugs to users...');

    // Find all users without slugs
    const usersWithoutSlugs = await prisma.user.findMany({
      where: {
        OR: [{ slug: null }, { slug: '' }, { slug: undefined }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        username: true,
        accountType: true,
      },
    });

    console.log(`Found ${usersWithoutSlugs.length} users without slugs`);

    let updated = 0;
    let errors = 0;

    for (const user of usersWithoutSlugs) {
      try {
        // Generate base name for slug
        let baseName = '';

        if (user.companyName) {
          baseName = user.companyName;
        } else if (user.firstName && user.lastName) {
          baseName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
          baseName = user.firstName;
        } else if (user.username) {
          baseName = user.username;
        } else {
          baseName = `agent-${user.accountType.toLowerCase()}`;
        }

        // Generate unique slug
        const slug = await generateUniqueSlug(baseName, prisma.user);

        // Update user with new slug
        await prisma.user.update({
          where: { id: user.id },
          data: { slug },
        });

        console.log(`✅ Updated user ${user.id} with slug: ${slug}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating user ${user.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully updated: ${updated} users`);
    console.log(`❌ Errors: ${errors} users`);
    console.log(`📋 Total processed: ${usersWithoutSlugs.length} users`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addSlugsToUsers();
