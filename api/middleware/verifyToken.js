import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const verifyToken = (req, res, next) => {
  // Check multiple sources for the token
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.split(' ')[1]; // Bearer token
  const token = cookieToken || headerToken;

  console.log('🔍 Auth Debug Info:');
  console.log('- Cookie token:', cookieToken ? 'Present' : 'Missing');
  console.log('- Header token:', headerToken ? 'Present' : 'Missing');
  console.log('- All cookies:', req.cookies);
  console.log('- Auth header:', req.headers.authorization);
  console.log('- Origin:', req.headers.origin);
  console.log('- User Agent:', req.headers['user-agent']);

  if (!token) {
    console.log('❌ No token found in cookies or headers');
    return res.status(401).json({
      message: 'Not Authenticated!',
      debug: {
        cookiesReceived: Object.keys(req.cookies || {}),
        authHeader: req.headers.authorization ? 'Present' : 'Missing',
      },
    });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      console.log('❌ JWT Verification failed:', err.message);
      return res.status(403).json({ message: 'Token is not Valid!' });
    }

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
        console.log('❌ User not found for ID:', payload.id);
        return res.status(403).json({ message: 'User not found!' });
      }

      if (user.status === 'BANNED') {
        console.log('❌ User is banned:', user.id);
        return res.status(403).json({ message: 'Account has been banned!' });
      }

      console.log(
        '✅ Authentication successful for user:',
        user.id,
        'Role:',
        user.role
      );
      req.userId = user.id;
      req.userRole = user.role;
      req.userStatus = user.status;
      next();
    } catch (error) {
      console.log('❌ Database error during auth:', error);
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

export const optionalAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    req.userId = null;
    req.userRole = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.id;
    req.userRole = decoded.role || 'USER';
    next();
  } catch (error) {
    // Invalid token, continue without authentication
    req.userId = null;
    req.userRole = null;
    next();
  }
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireStaffOrAdmin = requireRole(['STAFF', 'ADMIN']);
export const requireUser = requireRole(['USER', 'STAFF', 'ADMIN']);
