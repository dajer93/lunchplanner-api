const mealModel = require('../models/meal.model');

/**
 * Get all meals for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getMeals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const meals = await mealModel.getMealsByUserId(userId);
    
    res.status(200).json({ meals });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a meal by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getMealById = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    
    const meal = await mealModel.getMealById(mealId);
    
    if (!meal) {
      return res.status(404).json({ 
        message: 'Meal not found' 
      });
    }
    
    // Check if meal belongs to user
    if (meal.userId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to access this meal' 
      });
    }
    
    res.status(200).json({ meal });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new meal
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const createMeal = async (req, res, next) => {
  try {
    const { title, ingredients } = req.body;
    const userId = req.user.userId;
    
    // Validate request
    if (!title) {
      return res.status(400).json({ 
        message: 'Meal title is required' 
      });
    }
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        message: 'Meal must have at least one ingredient' 
      });
    }
    
    // Validate ingredients format
    const invalidIngredient = ingredients.find(
      ing => !ing.ingredientId || !ing.quantity
    );
    
    if (invalidIngredient) {
      return res.status(400).json({
        message: 'All ingredients must have ingredientId and quantity'
      });
    }
    
    const meal = await mealModel.createMeal(userId, { title, ingredients });
    
    res.status(201).json({
      message: 'Meal created successfully',
      meal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a meal
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const updateMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const { title, ingredients } = req.body;
    const userId = req.user.userId;
    
    // Validate request
    if (!title) {
      return res.status(400).json({ 
        message: 'Meal title is required' 
      });
    }
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        message: 'Meal must have at least one ingredient' 
      });
    }
    
    // Validate ingredients format
    const invalidIngredient = ingredients.find(
      ing => !ing.ingredientId || !ing.quantity
    );
    
    if (invalidIngredient) {
      return res.status(400).json({
        message: 'All ingredients must have ingredientId and quantity'
      });
    }
    
    const updatedMeal = await mealModel.updateMeal(
      mealId,
      userId,
      { title, ingredients }
    );
    
    res.status(200).json({
      message: 'Meal updated successfully',
      meal: updatedMeal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a meal
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const deleteMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const userId = req.user.userId;
    
    await mealModel.deleteMeal(mealId, userId);
    
    res.status(200).json({
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal
}; 