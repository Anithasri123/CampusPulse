import jwt from 'jsonwebtoken';

/**
 * Generate a JWT signed token for a user
 * @param {String} id - User ObjectId
 * @param {String} role - User role ('student' | 'admin')
 * @returns {String} Signed JWT token string
 */
export const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { id, role },
    secret,
    { expiresIn }
  );
};
