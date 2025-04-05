const userModel = require('../models/user.model');
const { verifyPassword } = require('../utils/password.utils');
const { generateToken } = require('../config/jwt.config');

/**
 * Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Create user
    const user = await userModel.createUser({ email, password, name });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }
    
    // Get user with password hash
    const user = await userModel.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    await userModel.updatePassword(userId, newPassword);
    
    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword
}; 