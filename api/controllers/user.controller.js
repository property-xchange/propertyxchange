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
    // Get user's own listings with more details
    const userListings = await prisma.listing.findMany({
      where: { userId: tokenUserId },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            companyName: true,
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
    });

    // Get saved listings
    const saved = await prisma.savedListing.findMany({
      where: { userId: tokenUserId },
      include: {
        listing: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                companyName: true,
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const savedListings = saved.map((item) => item.listing);

    // Return properly structured data
    res.status(200).json({
      userListings,
      savedListings,
      stats: {
        totalListings: userListings.length,
        approvedListings: userListings.filter((l) => l.status === 'APPROVED')
          .length,
        pendingListings: userListings.filter((l) => l.status === 'PENDING')
          .length,
        rejectedListings: userListings.filter((l) => l.status === 'REJECTED')
          .length,
        featuredListings: userListings.filter((l) => l.isFeatured).length,
        totalSaved: savedListings.length,
      },
    });
  } catch (err) {
    console.error('Profile listings error:', err);
    res.status(500).json({ message: 'Failed to get profile listings!' });
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

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenId = req.userId;
  const userRole = req.userRole;

  try {
    // Find the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        _count: {
          select: {
            Listing: true,
            blogs: true,
            savedlisting: true,
            blogComments: true,
          },
        },
      },
    });

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Permission checks:
    // - Users can only delete their own account
    // - Admins can delete any user account except other admins
    // - Prevent self-deletion for admins (they should transfer admin rights first)
    if (userRole === 'USER' && id !== tokenId) {
      return res.status(403).json({
        message: 'Not Authorized! You can only delete your own account.',
      });
    }

    if (userRole === 'ADMIN') {
      // Prevent deletion of other admins
      if (userToDelete.role === 'ADMIN' && id !== tokenId) {
        return res.status(403).json({
          message: 'Cannot delete another admin account!',
        });
      }

      // Warn about self-deletion
      if (id === tokenId) {
        return res.status(400).json({
          message:
            'Admin self-deletion requires confirmation. Use the dedicated endpoint.',
        });
      }
    }

    // Check if user has active content that needs handling
    const hasContent =
      userToDelete._count.Listing > 0 ||
      userToDelete._count.blogs > 0 ||
      userToDelete._count.blogComments > 0;

    // For users with significant content, we might want to anonymize instead of delete
    if (hasContent && userRole !== 'ADMIN') {
      return res.status(400).json({
        message:
          'Cannot delete account with active listings or content. Please contact support.',
        details: {
          listings: userToDelete._count.Listing,
          blogs: userToDelete._count.blogs,
          comments: userToDelete._count.blogComments,
        },
      });
    }

    // Begin transaction for safe deletion
    const result = await prisma.$transaction(async (tx) => {
      // Delete user account (this will cascade delete related records based on your schema)
      await tx.user.delete({
        where: { id },
      });

      return {
        deletedUser: {
          id: userToDelete.id,
          email: userToDelete.email,
          username: userToDelete.username,
          name: userToDelete.firstName || userToDelete.username,
        },
        contentRemoved: {
          listings: userToDelete._count.Listing,
          blogs: userToDelete._count.blogs,
          comments: userToDelete._count.blogComments,
          savedListings: userToDelete._count.savedlisting,
        },
      };
    });

    // If admin deleted another user, create audit log
    if (userRole === 'ADMIN' && id !== tokenId) {
      // Note: You might want to create an audit log table for this
      console.log(
        `Admin ${tokenId} deleted user account ${id} (${userToDelete.email})`
      );
    }

    res.status(200).json({
      message: 'Account deleted successfully',
      ...result,
    });
  } catch (error) {
    console.error('Delete user error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        message:
          'Cannot delete user due to existing dependencies. Please contact support.',
      });
    }

    res.status(500).json({
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// New function specifically for admin self-deletion with confirmation
export const deleteAdminSelf = async (req, res) => {
  const tokenId = req.userId;
  const { confirmationPassword, transferAdminTo } = req.body;

  try {
    // Verify admin user
    const admin = await prisma.user.findUnique({
      where: { id: tokenId },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can use this endpoint' });
    }

    // Verify password
    if (!confirmationPassword) {
      return res
        .status(400)
        .json({ message: 'Password confirmation required' });
    }

    const isPasswordValid = await bcrypt.compare(
      confirmationPassword,
      admin.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password confirmation' });
    }

    // Check if there's another admin to transfer rights to
    const otherAdmins = await prisma.user.count({
      where: {
        role: 'ADMIN',
        id: { not: tokenId },
        status: 'ACTIVE',
      },
    });

    if (otherAdmins === 0 && !transferAdminTo) {
      return res.status(400).json({
        message:
          'Cannot delete the last admin account. Please promote another user to admin first.',
      });
    }

    // If transferring rights, validate the target user
    if (transferAdminTo) {
      const targetUser = await prisma.user.findUnique({
        where: { id: transferAdminTo },
        select: { id: true, role: true, status: true },
      });

      if (!targetUser) {
        return res
          .status(400)
          .json({ message: 'Target user for admin transfer not found' });
      }

      if (targetUser.status !== 'ACTIVE') {
        return res
          .status(400)
          .json({ message: 'Cannot transfer admin rights to inactive user' });
      }

      // Promote target user to admin
      await prisma.user.update({
        where: { id: transferAdminTo },
        data: { role: 'ADMIN' },
      });
    }

    // Delete admin account
    await prisma.user.delete({
      where: { id: tokenId },
    });

    res.status(200).json({
      message: 'Admin account deleted successfully',
      adminTransferred: transferAdminTo ? true : false,
    });
  } catch (error) {
    console.error('Delete admin self error:', error);
    res.status(500).json({ message: 'Failed to delete admin account' });
  }
};

// New function for account deactivation (alternative to deletion)
export const deactivateAccount = async (req, res) => {
  const id = req.params.id;
  const tokenId = req.userId;
  const userRole = req.userRole;

  // Users can only deactivate their own account, admins can deactivate any account
  if (userRole === 'USER' && id !== tokenId) {
    return res.status(403).json({
      message: 'Not Authorized! You can only deactivate your own account.',
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: 'SUSPENDED', // or create a 'DEACTIVATED' status
        lastLogin: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        status: true,
      },
    });

    res.status(200).json({
      message: 'Account deactivated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Failed to deactivate account' });
  }
};
