import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Middleware to protect endpoints requiring authentication
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026';

      const decoded = jwt.verify(token, secret);

      // Attach authenticated user profile (excluding password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. User no longer exists.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('🔒 [Auth Middleware Error]:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }
};
