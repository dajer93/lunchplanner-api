const bcrypt = require('bcryptjs');

/**
 * Hash a password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verify if a password matches the hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  verifyPassword
}; 