import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const generateSlug = (title, type, location) => {
  const baseSlug = `${title}-${type}-${location}`
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

export const getListings = async (req, res) => {
  const query = req.query;
  const features = query.features ? query.features.split(',') : [];

  try {
    const where = {
      // Only show approved listings for public
      status: query.includeAll ? undefined : 'APPROVED',
      purpose: query.purpose || undefined,
      street: query.street || undefined,
      type: query.type || undefined,
      subType: query.subType || undefined,
      state: query.state || undefined,
      lga: query.lga || undefined,
      furnished: query.furnished === 'true' || undefined,
      parking: query.parking === 'true' || undefined,
      newlyBuilt: query.newlyBuilt === 'true' || undefined,
      serviced: query.serviced === 'true' || undefined,
      features: features.length > 0 ? { hasEvery: features } : undefined,
      toilets: parseInt(query.toilets) || undefined,
      number_of_bathrooms: parseInt(query.number_of_bathrooms) || undefined,
      number_of_beds: parseInt(query.number_of_beds) || undefined,
      price: {
        gte: parseInt(query.minPrice) || undefined,
        lte: parseInt(query.maxPrice) || undefined,
      },
      discountPrice: {
        gte: parseInt(query.minDiscountPrice) || undefined,
        lte: parseInt(query.maxDiscountPrice) || undefined,
      },
      createdAt: {
        gte: query.timestamp
          ? new Date(Date.now() - parseInt(query.timestamp))
          : undefined,
      },
    };

    const orderBy = {};
    if (query.sortBy === 'price') {
      orderBy.price = query.order || 'asc';
    } else if (query.sortBy === 'date') {
      orderBy.createdAt = query.order || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            companyName: true,
            companyPhoto: true,
            verified: true,
            accountType: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
    });

    res.status(200).json(listings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get Listings' });
  }
};
export const getListing = async (req, res) => {
  const { id } = req.params;
  const isSlug = !id.match(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  );

  try {
    const listing = await prisma.listing.findUnique({
      where: isSlug ? { slug: id } : { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
            companyPhoto: true,
            companyName: true,
            firstName: true,
            lastName: true,
            verified: true,
            accountType: true,
            address: true,
            state: true,
            lga: true,
            aboutCompany: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Get related listings (same agent and similar category)
    const relatedListings = await prisma.listing.findMany({
      where: {
        id: { not: listing.id },
        status: 'APPROVED',
        OR: [
          { userId: listing.userId }, // Same agent
          { purpose: listing.purpose }, // Same category
          { type: listing.type }, // Same type
        ],
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            companyName: true,
            verified: true,
          },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          return res.status(200).json({
            ...listing,
            relatedListings,
            isSaved: false,
          });
        }

        const saved = await prisma.savedListing.findUnique({
          where: {
            userId_listingId: {
              listingId: listing.id,
              userId: payload.id,
            },
          },
        });

        return res.status(200).json({
          ...listing,
          relatedListings,
          isSaved: saved ? true : false,
        });
      });
    } else {
      return res.status(200).json({
        ...listing,
        relatedListings,
        isSaved: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get Listing' });
  }
};

// export const addListing = async (req, res) => {
//   const body = req.body;
//   const tokenUserId = req.userId;

//   try {
//     // Check if user profile is completed (for USER role only)
//     const user = await prisma.user.findUnique({
//       where: { id: tokenUserId },
//       select: {
//         role: true,
//         profileCompleted: true,
//         phoneNumber: true,
//         whatsAppNum: true,
//         accountType: true,
//         address: true,
//         lga: true,
//         state: true,
//         companyRegDocument: true,
//       },
//     });

//     if (user.role === 'USER' && !user.profileCompleted) {
//       const requiredFields = [
//         'phoneNumber',
//         'whatsAppNum',
//         'accountType',
//         'address',
//         'lga',
//         'state',
//       ];
//       const missingFields = requiredFields.filter((field) => !user[field]);

//       // For company/business accounts, check for registration documents
//       if (user.accountType !== 'INDIVIDUAL' && !user.companyRegDocument) {
//         missingFields.push('companyRegDocument');
//       }

//       if (missingFields.length > 0) {
//         return res.status(400).json({
//           message: 'Please complete your profile before creating listings',
//           missingFields,
//           redirectTo: '/profile',
//         });
//       }
//     }

//     // Generate slug
//     const slug = generateSlug(body.name, body.type, body.lga);

//     const newListing = await prisma.listing.create({
//       data: {
//         ...body,
//         slug,
//         userId: tokenUserId,
//         status: user.role === 'USER' ? 'PENDING' : 'APPROVED', // Auto-approve for staff/admin
//       },
//     });

//     // Create notification for admins/staff about new listing
//     if (user.role === 'USER') {
//       const adminsAndStaff = await prisma.user.findMany({
//         where: {
//           role: { in: ['ADMIN', 'STAFF'] },
//         },
//         select: { id: true },
//       });

//       for (const admin of adminsAndStaff) {
//         await createNotification(
//           admin.id,
//           'New Listing Submitted',
//           `A new property listing "${body.name}" has been submitted for review`,
//           'NEW_LISTING',
//           'listing',
//           newListing.id
//         );
//       }
//     }

//     res.status(200).json(newListing);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: 'Failed to create Listing' });
//   }
// };

export const addListing = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    // Check if user profile is completed (for USER role only)
    const user = await prisma.user.findUnique({
      where: { id: tokenUserId },
      select: {
        role: true,
        profileCompleted: true,
        phoneNumber: true,
        whatsAppNum: true,
        accountType: true,
        address: true,
        lga: true,
        state: true,
        companyRegDocument: true,
      },
    });

    if (user.role === 'USER' && !user.profileCompleted) {
      const requiredFields = [
        'phoneNumber',
        'whatsAppNum',
        'accountType',
        'address',
        'lga',
        'state',
      ];
      const missingFields = requiredFields.filter((field) => !user[field]);

      if (user.accountType !== 'INDIVIDUAL' && !user.companyRegDocument) {
        missingFields.push('companyRegDocument');
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Please complete your profile before creating listings',
          missingFields,
          redirectTo: '/profile',
        });
      }
    }

    // Convert enum values to match Prisma schema exactly
    const purposeMap = {
      sale: 'SALE',
      rent: 'RENT',
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

    // Complete SubType mapping based on your Prisma schema
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
      purposeMap[body.purpose.toLowerCase()] || body.purpose.toUpperCase();
    const mappedType =
      typeMap[body.type.toLowerCase()] ||
      body.type.toUpperCase().replace(/[^A-Z]/g, '_');
    const mappedSubType = body.subType
      ? subTypeMap[body.subType.toLowerCase()] ||
        body.subType.toUpperCase().replace(/[^A-Z]/g, '_')
      : null;

    console.log('Original values:', {
      purpose: body.purpose,
      type: body.type,
      subType: body.subType,
    });
    console.log('Mapped values:', {
      purpose: mappedPurpose,
      type: mappedType,
      subType: mappedSubType,
    });

    // Generate slug
    const slug = generateSlug(body.name, body.type, body.lga);

    // Prepare listing data
    const listingData = {
      name: body.name,
      price: parseFloat(body.price),
      purpose: mappedPurpose,
      type: mappedType,
      number_of_beds: parseInt(body.number_of_beds) || 0,
      number_of_bathrooms: parseInt(body.number_of_bathrooms) || 0,
      toilets: parseInt(body.toilets) || 0,
      latitude: body.latitude,
      longitude: body.longitude,
      discountPercent: body.discountPercent
        ? parseFloat(body.discountPercent)
        : null,
      discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
      discountEndDate: body.discountEndDate
        ? new Date(body.discountEndDate)
        : null,
      installment: Boolean(body.installment),
      appendTo: body.appendTo || null,
      installmentAppendTo: body.installmentAppendTo || null,
      initialPayment: body.initialPayment
        ? parseFloat(body.initialPayment)
        : null,
      monthlyPayment: body.monthlyPayment
        ? parseFloat(body.monthlyPayment)
        : null,
      duration: body.duration ? parseInt(body.duration) : null,
      furnished: Boolean(body.furnished),
      serviced: Boolean(body.serviced),
      newlyBuilt: Boolean(body.newlyBuilt),
      parking: Boolean(body.parking),
      offer: Boolean(body.offer),
      youtubeLink: body.youtubeLink || null,
      instagramLink: body.instagramLink || null,
      features: body.features || [],
      street: body.street,
      lga: body.lga,
      state: body.state,
      description: body.description,
      images: body.images || [],
      slug,
      userId: tokenUserId,
      status: user.role === 'USER' ? 'PENDING' : 'APPROVED',
    };

    // Only add subType if it exists and is mapped
    if (mappedSubType) {
      listingData.subType = mappedSubType;
    }

    console.log('Final listing data:', listingData);

    const newListing = await prisma.listing.create({
      data: listingData,
    });

    // Create notification for admins/staff about new listing
    if (user.role === 'USER') {
      const adminsAndStaff = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'STAFF'] },
        },
        select: { id: true },
      });

      for (const admin of adminsAndStaff) {
        await createNotification(
          admin.id,
          'New Listing Submitted',
          `A new property listing "${body.name}" has been submitted for review`,
          'NEW_LISTING',
          'listing',
          newListing.id
        );
      }
    }

    res.status(200).json(newListing);
  } catch (err) {
    console.log('Create listing error:', err);
    console.log('Error stack:', err.stack);

    // More specific error handling
    if (err.code === 'P2002') {
      return res
        .status(400)
        .json({ message: 'A listing with this slug already exists' });
    }

    if (err.code === 'P2003') {
      return res
        .status(400)
        .json({ message: 'Invalid reference data provided' });
    }

    res.status(500).json({
      message: 'Failed to create listing',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

export const updateListing = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const tokenUserId = req.userId;
  const userRole = req.userRole;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check permissions
    if (userRole === 'USER' && listing.userId !== tokenUserId) {
      return res.status(403).json({ message: 'Not Authorized!' });
    }

    // Update slug if name changed
    if (body.name && body.name !== listing.name) {
      body.slug = generateSlug(
        body.name,
        body.type || listing.type,
        body.lga || listing.lga
      );
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    res.status(200).json(updatedListing);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to update Listing' });
  }
};

export const deleteListing = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const userRole = req.userRole;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check permissions
    if (userRole === 'USER' && listing.userId !== tokenUserId) {
      return res.status(403).json({ message: 'Not Authorized!' });
    }

    await prisma.listing.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Listing deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to delete Listing' });
  }
};

export const getAllListingsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      purpose,
      type,
      search,
      userId,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(purpose && { purpose }),
      ...(type && { type }),
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { street: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePhoto: true,
              companyName: true,
              verified: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.listing.count({ where }),
    ]);

    res.status(200).json({
      listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get listings admin error:', error);
    res.status(500).json({ message: 'Failed to fetch listings!' });
  }
};

export const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            username: true,
          },
        },
      },
    });

    // Notify listing owner
    await createNotification(
      listing.user.id,
      'Listing Approved',
      `Your property listing "${listing.name}" has been approved and is now live`,
      'LISTING_APPROVED',
      'listing',
      listing.id
    );

    res.status(200).json(listing);
  } catch (error) {
    console.error('Approve listing error:', error);
    res.status(500).json({ message: 'Failed to approve listing!' });
  }
};

export const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            username: true,
          },
        },
      },
    });

    // Notify listing owner
    await createNotification(
      listing.user.id,
      'Listing Rejected',
      `Your property listing "${listing.name}" has been rejected. Reason: ${reason}`,
      'LISTING_REJECTED',
      'listing',
      listing.id
    );

    res.status(200).json(listing);
  } catch (error) {
    console.error('Reject listing error:', error);
    res.status(500).json({ message: 'Failed to reject listing!' });
  }
};

export const addListingReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const userId = req.userId;

    // Check if user already reviewed this listing
    const existingReview = await prisma.listingReview.findUnique({
      where: {
        listingId_authorId: {
          listingId,
          authorId: userId,
        },
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this property' });
    }

    const review = await prisma.listingReview.create({
      data: {
        listingId,
        authorId: userId,
        rating,
        comment,
      },
      include: {
        author: {
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

    // Notify admins/staff about new review
    const adminsAndStaff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] },
      },
      select: { id: true },
    });

    for (const admin of adminsAndStaff) {
      await createNotification(
        admin.id,
        'New Review Submitted',
        `A new review has been submitted for approval`,
        'REVIEW_SUBMITTED',
        'review',
        review.id
      );
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review!' });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.listingReview.update({
      where: { id },
      data: { isApproved: true },
    });

    res.status(200).json(review);
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Failed to approve review!' });
  }
};

export const getListingStats = async (req, res) => {
  try {
    const [
      totalListings,
      approvedListings,
      pendingListings,
      rejectedListings,
      totalReviews,
      pendingReviews,
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'APPROVED' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'REJECTED' } }),
      prisma.listingReview.count(),
      prisma.listingReview.count({ where: { isApproved: false } }),
    ]);

    res.status(200).json({
      totalListings,
      approvedListings,
      pendingListings,
      rejectedListings,
      totalReviews,
      pendingReviews,
    });
  } catch (error) {
    console.error('Get listing stats error:', error);
    res.status(500).json({ message: 'Failed to fetch listing statistics!' });
  }
};
