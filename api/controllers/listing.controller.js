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

  // Enhanced ID/Slug detection - check if it's a MongoDB ObjectId
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const isUUID =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(
      id
    );

  // If it's not an ObjectId or UUID, treat it as a slug
  const searchBySlug = !isObjectId && !isUUID;

  console.log('getListing called with:', {
    id,
    isObjectId,
    isUUID,
    searchBySlug,
    searchField: searchBySlug ? 'slug' : 'id',
  });

  try {
    const listing = await prisma.listing.findUnique({
      where: searchBySlug ? { slug: id } : { id },
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
      console.log('Listing not found for:', { id, searchBySlug });
      return res.status(404).json({
        message: 'Listing not found',
        searchedBy: searchBySlug ? 'slug' : 'id',
        searchValue: id,
      });
    }

    console.log('Listing found:', {
      listingId: listing.id,
      listingSlug: listing.slug,
      listingName: listing.name,
    });

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
    console.error('getListing error:', err);
    res.status(500).json({
      message: 'Failed to get Listing',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
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

    // Apply the same enum mapping logic as in addListing
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

    // Process the update data with enum mapping
    const updateData = { ...body };

    // Map purpose if provided
    if (body.purpose) {
      const lowerPurpose = body.purpose.toLowerCase();
      updateData.purpose =
        purposeMap[lowerPurpose] || body.purpose.toUpperCase();
    }

    // Map type if provided
    if (body.type) {
      const lowerType = body.type.toLowerCase();
      updateData.type =
        typeMap[lowerType] || body.type.toUpperCase().replace(/[^A-Z]/g, '_');
    }

    // Map subType if provided
    if (body.subType) {
      const lowerSubType = body.subType.toLowerCase();
      updateData.subType =
        subTypeMap[lowerSubType] ||
        body.subType.toUpperCase().replace(/[^A-Z]/g, '_');
    }

    // Parse numeric fields
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.number_of_beds)
      updateData.number_of_beds = parseInt(body.number_of_beds);
    if (body.number_of_bathrooms)
      updateData.number_of_bathrooms = parseInt(body.number_of_bathrooms);
    if (body.toilets) updateData.toilets = parseInt(body.toilets);
    if (body.discountPercent)
      updateData.discountPercent = parseFloat(body.discountPercent);
    if (body.discountPrice)
      updateData.discountPrice = parseFloat(body.discountPrice);
    if (body.initialPayment)
      updateData.initialPayment = parseFloat(body.initialPayment);
    if (body.monthlyPayment)
      updateData.monthlyPayment = parseFloat(body.monthlyPayment);
    if (body.duration) updateData.duration = parseInt(body.duration);

    // Parse boolean fields
    if (body.installment !== undefined)
      updateData.installment = Boolean(body.installment);
    if (body.furnished !== undefined)
      updateData.furnished = Boolean(body.furnished);
    if (body.serviced !== undefined)
      updateData.serviced = Boolean(body.serviced);
    if (body.newlyBuilt !== undefined)
      updateData.newlyBuilt = Boolean(body.newlyBuilt);
    if (body.parking !== undefined) updateData.parking = Boolean(body.parking);
    if (body.offer !== undefined) updateData.offer = Boolean(body.offer);

    // Handle date fields
    if (body.discountEndDate) {
      updateData.discountEndDate = new Date(body.discountEndDate);
    }

    // Update slug if name, type, or lga changed
    if (body.name && body.name !== listing.name) {
      updateData.slug = generateSlug(
        body.name,
        updateData.type || listing.type,
        body.lga || listing.lga
      );
    }

    // Set updatedAt
    updateData.updatedAt = new Date();

    console.log('Update data being processed:', {
      originalPurpose: body.purpose,
      mappedPurpose: updateData.purpose,
      originalType: body.type,
      mappedType: updateData.type,
      originalSubType: body.subType,
      mappedSubType: updateData.subType,
    });

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedListing);
  } catch (err) {
    console.error('Update listing error:', err);
    console.error('Error details:', {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });

    // Handle specific Prisma errors
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

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(500).json({
      message: 'Failed to update listing',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
  }
};

export const deleteListing = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const userRole = req.userRole;

  try {
    // Check if listing exists and get listing details
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        savedListing: true, // Include saved listings to check relationships
        reviews: true, // Include reviews to check relationships
        requestResponses: true, // Include request responses
      },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    console.log('Listing found:', {
      listingId: listing.id,
      listingSlug: listing.slug,
      listingName: listing.name,
      savedListingsCount: listing.savedListing?.length || 0,
      reviewsCount: listing.reviews?.length || 0,
      requestResponsesCount: listing.requestResponses?.length || 0,
    });

    // Check permissions:
    // - Users can only delete their own listings
    // - Admins can delete any listing
    // - Staff can delete any listing (if you want to allow this)
    if (userRole === 'USER' && listing.userId !== tokenUserId) {
      return res.status(403).json({
        message: 'Not Authorized! You can only delete your own listings.',
      });
    }

    // Use transaction to safely delete all related records
    const result = await prisma.$transaction(async (tx) => {
      // Delete all saved listings first
      if (listing.savedListing?.length > 0) {
        await tx.savedListing.deleteMany({
          where: { listingId: id },
        });
        console.log(`Deleted ${listing.savedListing.length} saved listings`);
      }

      // Delete all reviews for this listing
      if (listing.reviews?.length > 0) {
        await tx.listingReview.deleteMany({
          where: { listingId: id },
        });
        console.log(`Deleted ${listing.reviews.length} reviews`);
      }

      // Delete all request responses for this listing
      if (listing.requestResponses?.length > 0) {
        await tx.requestResponse.deleteMany({
          where: { listingId: id },
        });
        console.log(
          `Deleted ${listing.requestResponses.length} request responses`
        );
      }

      // Now delete the listing itself
      await tx.listing.delete({
        where: { id },
      });

      console.log(`Deleted listing: ${listing.name}`);

      return {
        deletedListing: {
          id: listing.id,
          name: listing.name,
          slug: listing.slug,
          owner: listing.user.firstName || listing.user.username,
        },
        relatedRecordsDeleted: {
          savedListings: listing.savedListing?.length || 0,
          reviews: listing.reviews?.length || 0,
          requestResponses: listing.requestResponses?.length || 0,
        },
      };
    });

    // Create notification for listing owner if deleted by admin/staff
    if (userRole !== 'USER' && listing.userId !== tokenUserId) {
      try {
        await createNotification(
          listing.userId,
          'Listing Deleted',
          `Your property listing "${listing.name}" has been deleted by an administrator`,
          'GENERAL',
          'listing',
          listing.id
        );
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the entire operation if notification fails
      }
    }

    res.status(200).json({
      message: 'Listing and all related data deleted successfully',
      ...result,
    });
  } catch (err) {
    console.error('Delete listing error:', err);

    // Handle specific Prisma errors
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        message:
          'Cannot delete listing due to existing dependencies. Please contact support.',
      });
    }

    if (err.code === 'P2014') {
      return res.status(400).json({
        message:
          'Cannot delete listing due to related saved listings or reviews. Please try again.',
      });
    }

    res.status(500).json({
      message: 'Failed to delete listing',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
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

// Get featured listings
export const getFeaturedListings = async (req, res) => {
  try {
    const featuredListings = await prisma.listing.findMany({
      where: {
        status: 'APPROVED',
        isFeatured: true,
      },
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
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 featured properties
    });

    res.status(200).json(featuredListings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get featured listings' });
  }
};

// Toggle featured status (Admin/Staff only)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: { isFeatured },
    });

    res.status(200).json({
      message: `Listing ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      listing,
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Failed to update featured status' });
  }
};

// Create a review for a listing
export const addListingReview = async (req, res) => {
  const { listingId, rating, comment } = req.body;
  const userId = req.userId;

  try {
    // Validate input
    if (!listingId || !rating || !comment) {
      return res.status(400).json({
        message: 'Listing ID, rating, and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, name: true, userId: true },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Prevent users from reviewing their own listings
    if (listing.userId === userId) {
      return res.status(400).json({
        message: 'You cannot review your own listing',
      });
    }

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
      return res.status(400).json({
        message: 'You have already reviewed this listing',
      });
    }

    // Create the review
    const review = await prisma.listingReview.create({
      data: {
        listingId,
        authorId: userId,
        rating,
        comment,
        isApproved: false, // Reviews need approval
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
        listing: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Create notification for listing owner
    try {
      await createNotification(
        listing.userId,
        'New Review Submitted',
        `A new review has been submitted for your listing "${listing.name}"`,
        'REVIEW_SUBMITTED',
        'listing',
        listing.id
      );
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    res.status(201).json({
      message: 'Review submitted successfully and is pending approval',
      review,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// Get all reviews for admin/staff management
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status, // 'approved', 'pending', 'all'
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ...(status === 'approved' && { isApproved: true }),
      ...(status === 'pending' && { isApproved: false }),
      ...(search && {
        OR: [
          { comment: { contains: search, mode: 'insensitive' } },
          {
            listing: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          {
            author: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [reviews, total] = await Promise.all([
      prisma.listingReview.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
              verified: true,
            },
          },
          listing: {
            select: {
              id: true,
              name: true,
              slug: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.listingReview.count({ where }),
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Approve a review
export const approveReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.listingReview.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, firstName: true },
        },
        listing: {
          select: { id: true, name: true },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await prisma.listingReview.update({
      where: { id },
      data: { isApproved: true },
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
        listing: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Notify the review author
    try {
      await createNotification(
        review.author.id,
        'Review Approved',
        `Your review for "${review.listing.name}" has been approved`,
        'REVIEW_APPROVED',
        'listing',
        review.listing.id
      );
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    res.status(200).json({
      message: 'Review approved successfully',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Failed to approve review' });
  }
};

// Reject/Delete a review
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const review = await prisma.listingReview.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, firstName: true },
        },
        listing: {
          select: { id: true, name: true },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await prisma.listingReview.delete({
      where: { id },
    });

    // Notify the review author if reason provided
    if (reason) {
      try {
        await createNotification(
          review.author.id,
          'Review Rejected',
          `Your review for "${review.listing.name}" was rejected. Reason: ${reason}`,
          'REVIEW_REJECTED',
          'listing',
          review.listing.id
        );
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
    }

    res.status(200).json({
      message: 'Review deleted successfully',
      deletedReview: {
        id: review.id,
        author: review.author.firstName || review.author.username,
        listing: review.listing.name,
      },
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

// Get reviews for a specific listing (public)
export const getListingReviews = async (req, res) => {
  const { listingId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, averageRating] = await Promise.all([
      prisma.listingReview.findMany({
        where: {
          listingId,
          isApproved: true, // Only show approved reviews
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.listingReview.count({
        where: {
          listingId,
          isApproved: true,
        },
      }),
      prisma.listingReview.aggregate({
        where: {
          listingId,
          isApproved: true,
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.listingReview.groupBy({
      by: ['rating'],
      where: {
        listingId,
        isApproved: true,
      },
      _count: {
        rating: true,
      },
    });

    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      ratingCounts[item.rating] = item._count.rating;
    });

    res.status(200).json({
      reviews,
      averageRating: averageRating._avg.rating || 0,
      totalReviews: total,
      ratingDistribution: ratingCounts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get listing reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const [
      totalReviews,
      approvedReviews,
      pendingReviews,
      averageRating,
      recentReviews,
    ] = await Promise.all([
      prisma.listingReview.count(),
      prisma.listingReview.count({ where: { isApproved: true } }),
      prisma.listingReview.count({ where: { isApproved: false } }),
      prisma.listingReview.aggregate({
        where: { isApproved: true },
        _avg: { rating: true },
      }),
      prisma.listingReview.findMany({
        where: { isApproved: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              username: true,
              firstName: true,
            },
          },
          listing: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      totalReviews,
      approvedReviews,
      pendingReviews,
      averageRating: averageRating._avg.rating || 0,
      recentReviews,
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Failed to fetch review statistics' });
  }
};
