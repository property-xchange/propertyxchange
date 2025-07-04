import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log(token);

  if (!token) return res.status(401).json({ message: 'Not Authenticated!' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token is not Valid!' });

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          verified: true,
          emailVerified: true,
        },
      });

      if (!user) {
        return res.status(403).json({ message: 'User not found!' });
      }

      if (user.status === 'BANNED') {
        return res.status(403).json({ message: 'Account has been banned!' });
      }

      req.userId = user.id;
      req.userRole = user.role;
      req.userStatus = user.status;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Authentication required!' });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions to access this resource!',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireStaffOrAdmin = requireRole(['STAFF', 'ADMIN']);
export const requireUser = requireRole(['USER', 'STAFF', 'ADMIN']);
