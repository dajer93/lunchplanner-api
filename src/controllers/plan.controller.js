const planModel = require('../models/plan.model');
const mealModel = require('../models/meal.model');

/**
 * Get user's meal plan for a date range
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getMealPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    
    let planDays;
    
    if (startDate && endDate) {
      // Get plan for date range
      planDays = await planModel.getPlanRange(userId, startDate, endDate);
    } else {
      // Get entire plan
      planDays = await planModel.getUserPlan(userId);
    }
    
    res.status(200).json({ planDays });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific day from the meal plan
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getPlanDay = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;
    
    const planDay = await planModel.getPlanDay(userId, date);
    
    if (!planDay) {
      return res.status(200).json({ 
        planDay: {
          userId,
          date,
          meals: []
        } 
      });
    }
    
    res.status(200).json({ planDay });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a day in the meal plan
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const updatePlanDay = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;
    const { meals } = req.body;
    
    // Validate request
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (!Array.isArray(meals)) {
      return res.status(400).json({
        message: 'Meals must be an array of meal IDs'
      });
    }
    
    // Verify all meal IDs belong to the user
    if (meals.length > 0) {
      const mealPromises = meals.map(mealId => mealModel.getMealById(mealId));
      const mealResults = await Promise.all(mealPromises);
      
      const invalidMeal = mealResults.find(
        (meal, index) => !meal || meal.userId !== userId
      );
      
      if (invalidMeal !== undefined) {
        return res.status(400).json({
          message: 'One or more meal IDs are invalid or not accessible'
        });
      }
    }
    
    const updatedPlanDay = await planModel.updatePlanDay(userId, date, meals);
    
    res.status(200).json({
      message: 'Meal plan updated successfully',
      planDay: updatedPlanDay
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a day from the meal plan
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const deletePlanDay = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;
    
    await planModel.deletePlanDay(userId, date);
    
    res.status(200).json({
      message: 'Plan day deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear the entire meal plan
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const clearPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await planModel.clearUserPlan(userId);
    
    res.status(200).json({
      message: 'Meal plan cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a shopping list from the meal plan
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const getShoppingList = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    
    let planDays;
    
    if (startDate && endDate) {
      // Get plan for date range
      planDays = await planModel.getPlanRange(userId, startDate, endDate);
    } else {
      // Get entire plan
      planDays = await planModel.getUserPlan(userId);
    }
    
    // If no plan days, return empty shopping list
    if (planDays.length === 0) {
      return res.status(200).json({ 
        shoppingList: [] 
      });
    }
    
    // Get all meals in the plan
    const mealIds = new Set();
    planDays.forEach(day => {
      day.meals.forEach(mealId => mealIds.add(mealId));
    });
    
    const mealPromises = Array.from(mealIds).map(mealId => 
      mealModel.getMealById(mealId)
    );
    
    const meals = await Promise.all(mealPromises);
    
    // Aggregate ingredients
    const ingredientMap = new Map();
    
    meals.forEach(meal => {
      if (!meal) return;
      
      meal.ingredients.forEach(ingredient => {
        const key = ingredient.ingredientId;
        
        if (ingredientMap.has(key)) {
          ingredientMap.get(key).quantities.push(ingredient.quantity);
        } else {
          ingredientMap.set(key, {
            ingredientId: ingredient.ingredientId,
            name: ingredient.name,
            quantities: [ingredient.quantity]
          });
        }
      });
    });
    
    // Convert map to array and format quantities
    const shoppingList = Array.from(ingredientMap.values()).map(item => ({
      ingredientId: item.ingredientId,
      name: item.name,
      quantities: item.quantities,
      quantity: item.quantities.join(', ')
    }));
    
    res.status(200).json({ shoppingList });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMealPlan,
  getPlanDay,
  updatePlanDay,
  deletePlanDay,
  clearPlan,
  getShoppingList
}; 