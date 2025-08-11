import { generateUniqueSlug } from '../utils/slugGenerator.js';
import prisma from '../lib/prisma.js';

// Middleware to generate slug on user creation/update
export const userSlugMiddleware = async (req, res, next) => {
  try {
    // Only process if creating or updating user data that affects the slug
    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH'
    ) {
      const { firstName, lastName, companyName, username } = req.body;

      // Generate slug if user data is being created/updated
      if (firstName || lastName || companyName || username) {
        const baseName =
          companyName ||
          `${firstName || ''} ${lastName || ''}`.trim() ||
          username ||
          'agent';

        const slug = await generateUniqueSlug(baseName, prisma.user);
        req.body.slug = slug;
      }
    }

    next();
  } catch (error) {
    console.error('Slug middleware error:', error);
    next(error);
  }
};

// Update existing users without slugs
export const updateExistingUserSlugs = async () => {
  try {
    const usersWithoutSlugs = await prisma.user.findMany({
      where: {
        OR: [{ slug: null }, { slug: '' }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        username: true,
      },
    });

    console.log(`Found ${usersWithoutSlugs.length} users without slugs`);

    for (const user of usersWithoutSlugs) {
      const baseName =
        user.companyName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.username ||
        'agent';

      const slug = await generateUniqueSlug(baseName, prisma.user);

      await prisma.user.update({
        where: { id: user.id },
        data: { slug },
      });

      console.log(`Updated user ${user.id} with slug: ${slug}`);
    }

    console.log('Finished updating user slugs');
  } catch (error) {
    console.error('Error updating existing user slugs:', error);
  }
};
