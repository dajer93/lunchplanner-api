const { verifyToken } = require('../config/jwt.config');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateJWT = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  // Check if the header format is correct
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format. Use Bearer <token>' });
  }

  const token = parts[1];

  try {
    // Verify the token
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.sub,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticateJWT
}; 