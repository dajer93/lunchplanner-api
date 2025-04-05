const userModel = require('../models/user.model');

/**
 * Get user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    
    // Validate request
    if (!name) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }
    
    const updatedUser = await userModel.updateUser(userId, { name });
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await userModel.deleteUser(userId);
    
    res.status(200).json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
}; 