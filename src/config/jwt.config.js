const jwt = require('jsonwebtoken');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Generate a JWT token for a user
 * @param {Object} user - The user object
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    sub: user.userId,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRATION,
  generateToken,
  verifyToken
}; 