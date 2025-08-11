import prisma from '../lib/prisma.js';
import { generateSlug } from '../utils/slugGenerator.js';

// Utility function to generate agent slug
const generateAgentSlug = (agent) => {
  const baseName =
    agent.companyName ||
    `${agent.firstName || ''} ${agent.lastName || ''}`.trim() ||
    agent.username;
  return generateSlug(baseName);
};

// Helper function to check if string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const getAllAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      verified,
      accountType,
      state,
      lga,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause - filter by role instead of accountType
    const where = {
      // Only show users who are agents (not regular users with role USER)
      role: { not: 'USER' },
      ...(verified !== undefined && { verified: verified === 'true' }),
      ...(accountType && { accountType }),
      ...(state && { state }),
      ...(lga && { lga }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { aboutCompany: { contains: search, mode: 'insensitive' } },
          { services: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          slug: true,
          username: true,
          firstName: true,
          lastName: true,
          title: true,
          profilePhoto: true,
          companyPhoto: true,
          companyName: true,
          accountType: true,
          verified: true,
          address: true,
          state: true,
          lga: true,
          aboutCompany: true,
          services: true,
          phoneNumber: true,
          whatsAppNum: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              Listing: {
                where: { status: 'APPROVED' },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    // Generate slugs for agents that don't have them
    const agentsWithSlugs = await Promise.all(
      agents.map(async (agent) => {
        if (!agent.slug) {
          const newSlug = generateAgentSlug(agent);
          await prisma.user.update({
            where: { id: agent.id },
            data: { slug: newSlug },
          });
          agent.slug = newSlug;
        }
        return agent;
      })
    );

    res.status(200).json({
      agents: agentsWithSlugs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Failed to fetch agents!' });
  }
};

export const getSingleAgent = async (req, res) => {
  try {
    const { slugOrId } = req.params;

    // Build where clause based on whether the parameter is a valid ObjectId or slug
    let whereClause;

    if (isValidObjectId(slugOrId)) {
      // If it's a valid ObjectId, search by both id and slug
      whereClause = {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        role: { not: 'USER' },
      };
    } else {
      // If it's not a valid ObjectId, only search by slug
      whereClause = {
        slug: slugOrId,
        role: { not: 'USER' },
      };
    }

    let agent = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        username: true,
        firstName: true,
        lastName: true,
        title: true,
        profilePhoto: true,
        companyPhoto: true,
        companyName: true,
        accountType: true,
        verified: true,
        address: true,
        state: true,
        lga: true,
        aboutCompany: true,
        services: true,
        phoneNumber: true,
        whatsAppNum: true,
        email: true,
        createdAt: true,
        Listing: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            slug: true,
            name: true,
            street: true,
            price: true,
            purpose: true,
            type: true,
            subType: true,
            number_of_beds: true,
            number_of_bathrooms: true,
            toilets: true,
            images: true,
            offer: true,
            discountPrice: true,
            discountEndDate: true,
            installment: true,
            appendTo: true,
            furnished: true,
            parking: true,
            serviced: true,
            newlyBuilt: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            Listing: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found!' });
    }

    // Generate slug if it doesn't exist
    if (!agent.slug) {
      const newSlug = generateAgentSlug(agent);
      await prisma.user.update({
        where: { id: agent.id },
        data: { slug: newSlug },
      });
      agent.slug = newSlug;
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error('Get single agent error:', error);
    res.status(500).json({ message: 'Failed to fetch agent!' });
  }
};

// Get agents by account type for navigation filtering
export const getAgentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Map navigation link text to account types
    const typeMapping = {
      'property-owner': 'INDIVIDUAL',
      'individual-agent': 'INDIVIDUAL',
      developer: 'DEVELOPER',
      'law-firm': 'LAW',
      surveying: 'SURVEY',
      'real-estate-organization': 'ORGANIZATION',
    };

    const accountType = typeMapping[type];
    if (!accountType) {
      return res.status(400).json({ message: 'Invalid agent type' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      accountType,
      role: { not: 'USER' },
    };

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          slug: true,
          username: true,
          firstName: true,
          lastName: true,
          title: true,
          profilePhoto: true,
          companyPhoto: true,
          companyName: true,
          accountType: true,
          verified: true,
          address: true,
          state: true,
          lga: true,
          aboutCompany: true,
          createdAt: true,
          _count: {
            select: {
              Listing: {
                where: { status: 'APPROVED' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      agents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get agents by type error:', error);
    res.status(500).json({ message: 'Failed to fetch agents by type!' });
  }
};
