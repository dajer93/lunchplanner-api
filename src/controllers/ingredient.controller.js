const ingredientModel = require('../models/ingredient.model');

/**
 * Get all ingredients for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getIngredients = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const ingredients = await ingredientModel.getIngredientsByUserId(userId);
    
    res.status(200).json({ ingredients });
  } catch (error) {
    next(error);
  }
};

/**
 * Get an ingredient by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getIngredientById = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    
    const ingredient = await ingredientModel.getIngredientById(ingredientId);
    
    if (!ingredient) {
      return res.status(404).json({ 
        message: 'Ingredient not found' 
      });
    }
    
    // Check if ingredient belongs to user
    if (ingredient.userId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to access this ingredient' 
      });
    }
    
    res.status(200).json({ ingredient });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new ingredient
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const createIngredient = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    
    // Validate request
    if (!name) {
      return res.status(400).json({ 
        message: 'Ingredient name is required' 
      });
    }
    
    const ingredient = await ingredientModel.createIngredient(userId, name);
    
    res.status(201).json({
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an ingredient
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const updateIngredient = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;
    
    // Validate request
    if (!name) {
      return res.status(400).json({ 
        message: 'Ingredient name is required' 
      });
    }
    
    const updatedIngredient = await ingredientModel.updateIngredient(
      ingredientId,
      userId,
      { name }
    );
    
    res.status(200).json({
      message: 'Ingredient updated successfully',
      ingredient: updatedIngredient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an ingredient
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const deleteIngredient = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const userId = req.user.userId;
    
    await ingredientModel.deleteIngredient(ingredientId, userId);
    
    res.status(200).json({
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient
}; 