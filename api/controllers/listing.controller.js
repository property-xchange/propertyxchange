import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const getListings = async (req, res) => {
  const query = req.query;
  const features = query.features ? query.features.split(',') : [];
  try {
    const listings = await prisma.listing.findMany({
      where: {
        purpose: query.purpose || undefined,
        street: query.street || undefined,
        type: query.type || undefined,
        subType: query.subType || undefined,
        furnished: query.furnished === 'true' || undefined,
        parking: query.parking === 'true' || undefined,
        newlyBuilt: query.newlyBuilt === 'true' || undefined,
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
      },
    });

    // setTimeout(() => {
    res.status(200).json(listings);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get Listings' });
  }
};

export const getListing = async (req, res) => {
  const id = req.params.id;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            profilePhoto: true,
            companyPhoto: true,
            companyName: true,
            firstName: true,
            lastName: true,
            verified: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          // If there's an error with token verification, send the response with isSaved false
          return res.status(200).json({ ...listing, isSaved: false });
        }

        const saved = await prisma.savedListing.findUnique({
          where: {
            userId_listingId: {
              listingId: id,
              userId: payload.id,
            },
          },
        });

        // Send the response with the isSaved flag based on whether the listing is saved or not
        return res
          .status(200)
          .json({ ...listing, isSaved: saved ? true : false });
      });
    } else {
      // If no token is provided, send the response with isSaved false
      return res.status(200).json({ ...listing, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get Listing' });
  }
};

export const addListing = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newListing = await prisma.listing.create({
      data: {
        ...body,
        userId: tokenUserId,
      },
    });
    res.status(200).json(newListing);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to create Listing' });
  }
};

export const updateListing = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to update Listings' });
  }
};

export const deleteListing = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (listing.userId !== tokenUserId) {
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
