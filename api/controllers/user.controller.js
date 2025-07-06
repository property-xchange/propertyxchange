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

export const getAllUsersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          role: true,
          status: true,
          verified: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          bannedAt: true,
          bannedReason: true,
          _count: {
            select: {
              Listing: true,
              blogs: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get users admin error:', error);
    res.status(500).json({ message: 'Failed to fetch users!' });
  }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      staffUsers,
      adminUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'BANNED' } }),
      prisma.user.count({ where: { role: 'STAFF' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    res.status(200).json({
      totalUsers,
      activeUsers,
      bannedUsers,
      staffUsers,
      adminUsers,
      newUsersThisMonth,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics!' });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' });
    }

    // Prevent self-demotion
    if (id === req.userId && role !== 'ADMIN') {
      return res.status(400).json({ message: 'Cannot change your own role!' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role!' });
  }
};

// Ban/Unban user (Admin only)
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Prevent self-ban
    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot ban yourself!' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const isBanned = user.status === 'BANNED';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: isBanned ? 'ACTIVE' : 'BANNED',
        bannedAt: isBanned ? null : new Date(),
        bannedReason: isBanned ? null : reason,
        bannedBy: isBanned ? null : req.userId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        bannedAt: true,
        bannedReason: true,
      },
    });

    res.status(200).json({
      user: updatedUser,
      message: isBanned
        ? 'User unbanned successfully!'
        : 'User banned successfully!',
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({ message: 'Failed to update user status!' });
  }
};

// Create user (Admin only)
export const createUserAdmin = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role = 'USER',
      phoneNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists!',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phoneNumber,
        emailVerified: true, // Admin created users are auto-verified
        verified: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user admin error:', error);
    res.status(500).json({ message: 'Failed to create user!' });
  }
};
