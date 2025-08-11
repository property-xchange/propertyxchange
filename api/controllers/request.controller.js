// server/controllers/request.controller.js
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const generateSlug = (name, purpose, location) => {
  const baseSlug = `${name}-${purpose}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  return `${baseSlug}-${Date.now()}`;
};

const createNotification = async (
  userId,
  title,
  message,
  type,
  entityType = null,
  entityId = null
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Create a new property request
export const createPropertyRequest = async (req, res) => {
  try {
    const {
      purpose,
      type,
      subType,
      state,
      lga,
      number_of_beds,
      budget,
      comments,
      name,
      email,
      phoneNumber,
      accountType,
      expiresAt,
    } = req.body;

    // Get user ID if authenticated
    const token = req.cookies?.token;
    let userId = null;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        userId = payload.id;
      } catch (error) {
        console.log('Invalid token:', error);
      }
    }

    // Generate slug
    const slug = generateSlug(name, purpose, lga);

    // Convert enum values to match Prisma schema
    const purposeMap = {
      rent: 'RENT',
      sale: 'SALE',
      'short-let': 'SHORT_LET',
      'joint-venture': 'JOINT_VENTURE',
    };

    const typeMap = {
      'co-working space': 'CO_WORKING_SPACE',
      'commercial property': 'COMMERCIAL_PROPERTY',
      'flat/apartment': 'FLAT_APARTMENT',
      house: 'HOUSE',
      land: 'LAND',
    };

    const accountTypeMap = {
      individual: 'INDIVIDUAL',
      law: 'LAW',
      survey: 'SURVEY',
      organization: 'ORGANIZATION',
      developer: 'DEVELOPER',
      investor: 'INVESTOR',
      other: 'OTHER',
    };

    const subTypeMap = {
      // Co-working Space
      'conference room': 'CONFERENCE_ROOM',
      desk: 'DESK',
      'meeting room': 'MEETING_ROOM',
      'private office': 'PRIVATE_OFFICE',
      workstation: 'WORKSTATION',

      // Commercial Property
      church: 'CHURCH',
      'event center': 'EVENT_CENTER',
      factory: 'FACTORY',
      'filling station': 'FILLING_STATION',
      'hotel guest house': 'HOTEL_GUEST_HOUSE',
      'office space': 'OFFICE_SPACE',
      school: 'SCHOOL',
      shop: 'SHOP',
      'shop in mall': 'SHOP_IN_MALL',
      'show room': 'SHOW_ROOM',
      'tank farm': 'TANK_FARM',
      warehouse: 'WAREHOUSE',

      // Flat/Apartment
      'boys quarter': 'BOYS_QUARTER',
      'mini flat': 'MINI_FLAT',
      'mini-flat': 'MINI_FLAT',
      penthouse: 'PENTHOUSE',
      'self contain': 'SELF_CONTAIN',
      'shared apartment': 'SHARED_APARTMENT',
      'studio apartment': 'STUDIO_APARTMENT',

      // House
      'block of flats': 'BLOCK_OF_FLATS',
      'detached bungalow': 'DETACHED_BUNGALOW',
      'detached duplex': 'DETACHED_DUPLEX',
      massionette: 'MASSIONETTE',
      'semi detached bungalow': 'SEMI_DETACHED_BUNGALOW',
      'semi detached duplex': 'SEMI_DETACHED_DUPLEX',
      'terraced bungalow': 'TERRACED_BUNGALOW',
      'terraced duplex': 'TERRACED_DUPLEX',

      // Land
      'commercial land': 'COMMERCIAL_LAND',
      'industrial land': 'INDUSTRIAL_LAND',
      'joint venture land': 'JOINT_VENTURE_LAND',
      'mixed use land': 'MIXED_USE_LAND',
      'residential land': 'RESIDENTIAL_LAND',
      'serviced residential land': 'SERVICED_RESIDENTIAL_LAND',
    };

    const mappedPurpose =
      purposeMap[purpose.toLowerCase()] || purpose.toUpperCase();
    const mappedType =
      typeMap[type.toLowerCase()] || type.toUpperCase().replace(/[^A-Z]/g, '_');
    const mappedSubType = subType
      ? subTypeMap[subType.toLowerCase()] ||
        subType.toUpperCase().replace(/[^A-Z]/g, '_')
      : null;
    const mappedAccountType =
      accountTypeMap[accountType.toLowerCase()] || accountType.toUpperCase();

    // Create the request
    const requestData = {
      slug,
      purpose: mappedPurpose,
      type: mappedType,
      state,
      lga,
      budget: parseFloat(budget),
      comments,
      name,
      email,
      phoneNumber,
      accountType: mappedAccountType,
      userId,
      number_of_beds: number_of_beds ? parseInt(number_of_beds) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    if (mappedSubType) {
      requestData.subType = mappedSubType;
    }

    const propertyRequest = await prisma.propertyRequest.create({
      data: requestData,
      include: {
        user: userId
          ? {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            }
          : false,
      },
    });

    // Notify agents/property owners in the same location
    const agentsInLocation = await prisma.user.findMany({
      where: {
        state: state,
        role: { in: ['USER', 'STAFF', 'ADMIN'] },
        accountType: { in: ['INDIVIDUAL', 'ORGANIZATION', 'DEVELOPER'] },
      },
      select: { id: true },
    });

    for (const agent of agentsInLocation) {
      await createNotification(
        agent.id,
        'New Property Request',
        `A new property request for ${mappedType} in ${lga}, ${state} with budget ₦${budget.toLocaleString()}`,
        'NEW_LISTING',
        'propertyRequest',
        propertyRequest.id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Property request created successfully',
      data: propertyRequest,
    });
  } catch (error) {
    console.error('Create property request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all property requests (with filters)
export const getPropertyRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      purpose,
      type,
      state,
      lga,
      minBudget,
      maxBudget,
      status = 'OPEN',
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: status === 'all' ? undefined : status,
      isPublic: true,
      ...(purpose && { purpose }),
      ...(type && { type }),
      ...(state && { state }),
      ...(lga && { lga }),
      ...(minBudget && { budget: { gte: parseFloat(minBudget) } }),
      ...(maxBudget && { budget: { lte: parseFloat(maxBudget) } }),
      ...(minBudget &&
        maxBudget && {
          budget: {
            gte: parseFloat(minBudget),
            lte: parseFloat(maxBudget),
          },
        }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { comments: { contains: search, mode: 'insensitive' } },
          { lga: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // Exclude expired requests
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    const [requests, total] = await Promise.all([
      prisma.propertyRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          _count: {
            select: {
              responses: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.propertyRequest.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get property requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property requests',
    });
  }
};

// Get single property request
export const getPropertyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);

    const request = await prisma.propertyRequest.findUnique({
      where: isSlug ? { slug: id } : { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            accountType: true,
          },
        },
        responses: {
          include: {
            agent: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                companyName: true,
                accountType: true,
                verified: true,
              },
            },
            listing: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found',
      });
    }

    // Increment view count
    await prisma.propertyRequest.update({
      where: { id: request.id },
      data: { viewCount: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Get property request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property request',
    });
  }
};

// Update property request
export const updatePropertyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenUserId = req.userId;
    const userRole = req.userRole;

    const request = await prisma.propertyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found',
      });
    }

    // Check permissions
    if (userRole === 'USER' && request.userId !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request',
      });
    }

    const updatedRequest = await prisma.propertyRequest.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Property request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Update property request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property request',
    });
  }
};

// Delete property request
export const deletePropertyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenUserId = req.userId;
    const userRole = req.userRole;

    const request = await prisma.propertyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found',
      });
    }

    // Check permissions
    if (userRole === 'USER' && request.userId !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request',
      });
    }

    await prisma.propertyRequest.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Property request deleted successfully',
    });
  } catch (error) {
    console.error('Delete property request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property request',
    });
  }
};

// Respond to property request (for agents)
export const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message, contactEmail, contactPhone, proposedPrice, listingId } =
      req.body;
    const agentId = req.userId;

    // Check if agent already responded
    const existingResponse = await prisma.requestResponse.findUnique({
      where: {
        requestId_agentId: {
          requestId,
          agentId,
        },
      },
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this request',
      });
    }

    // Check if request exists and is still open
    const request = await prisma.propertyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found',
      });
    }

    if (request.status === 'CLOSED' || request.status === 'EXPIRED') {
      return res.status(400).json({
        success: false,
        message: 'This request is no longer accepting responses',
      });
    }

    const response = await prisma.requestResponse.create({
      data: {
        requestId,
        agentId,
        message,
        contactEmail,
        contactPhone,
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        listingId,
      },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            companyName: true,
            accountType: true,
            verified: true,
          },
        },
        listing: listingId
          ? {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                slug: true,
              },
            }
          : false,
      },
    });

    // Notify request owner if they have an account
    if (request.userId) {
      await createNotification(
        request.userId,
        'New Response to Your Request',
        `An agent has responded to your property request for ${request.type} in ${request.lga}`,
        'GENERAL',
        'requestResponse',
        response.id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: response,
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response',
    });
  }
};

// Get user's property requests
export const getUserRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(status && { status }),
    };

    const [requests, total] = await Promise.all([
      prisma.propertyRequest.findMany({
        where,
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.propertyRequest.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user requests',
    });
  }
};

// Get request statistics
export const getRequestStats = async (req, res) => {
  try {
    const [
      totalRequests,
      openRequests,
      matchedRequests,
      closedRequests,
      totalResponses,
    ] = await Promise.all([
      prisma.propertyRequest.count(),
      prisma.propertyRequest.count({ where: { status: 'OPEN' } }),
      prisma.propertyRequest.count({ where: { status: 'MATCHED' } }),
      prisma.propertyRequest.count({ where: { status: 'CLOSED' } }),
      prisma.requestResponse.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        openRequests,
        matchedRequests,
        closedRequests,
        totalResponses,
      },
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request statistics',
    });
  }
};
