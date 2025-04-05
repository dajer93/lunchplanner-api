const { v4: uuidv4 } = require('uuid');
const { dynamoDB, tables } = require('../config/db.config');

/**
 * Create a new meal
 * @param {string} userId - User ID
 * @param {Object} mealData - Meal data
 * @returns {Object} - Created meal
 */
const createMeal = async (userId, mealData) => {
  const { title, ingredients } = mealData;
  
  const mealId = uuidv4();
  const timestamp = Date.now();
  
  const meal = {
    mealId,
    userId,
    title,
    ingredients,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const params = {
    TableName: tables.MEALS,
    Item: meal
  };
  
  await dynamoDB.put(params);
  return meal;
};

/**
 * Get meal by ID
 * @param {string} mealId - Meal ID
 * @returns {Object|null} - Meal object or null if not found
 */
const getMealById = async (mealId) => {
  const params = {
    TableName: tables.MEALS,
    Key: { mealId }
  };
  
  const result = await dynamoDB.get(params);
  return result.Item || null;
};

/**
 * Get meals by user ID
 * @param {string} userId - User ID
 * @returns {Array} - List of meals
 */
const getMealsByUserId = async (userId) => {
  const params = {
    TableName: tables.MEALS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const result = await dynamoDB.query(params);
  return result.Items || [];
};

/**
 * Update meal
 * @param {string} mealId - Meal ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated meal
 */
const updateMeal = async (mealId, userId, updateData) => {
  // Check if meal exists and belongs to user
  const meal = await getMealById(mealId);
  if (!meal) {
    const error = new Error('Meal not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (meal.userId !== userId) {
    const error = new Error('Not authorized to update this meal');
    error.statusCode = 403;
    throw error;
  }
  
  // Prepare update expression
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': Date.now()
  };
  
  // Add fields to update
  Object.keys(updateData).forEach(key => {
    if (key !== 'mealId' && key !== 'userId') {
      updateExpression += `, ${key} = :${key}`;
      expressionAttributeValues[`:${key}`] = updateData[key];
    }
  });
  
  const params = {
    TableName: tables.MEALS,
    Key: { mealId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(params);
  return result.Attributes;
};

/**
 * Delete meal
 * @param {string} mealId - Meal ID
 * @param {string} userId - User ID (for authorization)
 * @returns {boolean} - Success status
 */
const deleteMeal = async (mealId, userId) => {
  // Check if meal exists and belongs to user
  const meal = await getMealById(mealId);
  if (!meal) {
    const error = new Error('Meal not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (meal.userId !== userId) {
    const error = new Error('Not authorized to delete this meal');
    error.statusCode = 403;
    throw error;
  }
  
  const params = {
    TableName: tables.MEALS,
    Key: { mealId }
  };
  
  await dynamoDB.delete(params);
  return true;
};

module.exports = {
  createMeal,
  getMealById,
  getMealsByUserId,
  updateMeal,
  deleteMeal
}; 