import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const allUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Fail to get all users!' });
  }
};

export const singleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Fail to get a user!' });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenId = req.userId;
  const { password, profilePhoto, companyPhoto, ...inputs } = req.body;
  // console.log(id);
  // console.log(tokenId);

  if (id !== tokenId) {
    return res.status(403).json({ message: 'Not Authorized!' });
  }
  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
    const updateUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(profilePhoto && { profilePhoto }),
        ...(companyPhoto && { companyPhoto }),
      },
    });
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json({ message: 'Fail to update user!' });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenId = req.userId;

  if (id !== tokenId) {
    return res.status(403).json({ message: 'Not Authorized!' });
  }
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Fail to delete user!' });
  }
};

export const saveListing = async (req, res) => {
  const listingId = req.body.listingId;
  const tokenUserId = req.userId;

  try {
    const savedListing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: tokenUserId,
          listingId,
        },
      },
    });

    if (savedListing) {
      await prisma.savedListing.delete({
        where: {
          id: savedListing.id,
        },
      });
      res.status(200).json({ message: 'Listing removed from saved list' });
    } else {
      await prisma.savedListing.create({
        data: {
          userId: tokenUserId,
          listingId,
        },
      });
      res.status(200).json({ message: 'Listing saved' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to delete users!' });
  }
};

export const profileListings = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userListings = await prisma.listing.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedListing.findMany({
      where: { userId: tokenUserId },
      include: {
        listing: true,
      },
    });

    const savedListings = saved.map((item) => item.listing);
    res.status(200).json({ userListings, savedListings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get profile Listings!' });
  }
};
