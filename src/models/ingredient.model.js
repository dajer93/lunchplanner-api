const { v4: uuidv4 } = require('uuid');
const { dynamoDB, tables } = require('../config/db.config');

/**
 * Create a new ingredient
 * @param {string} userId - User ID
 * @param {string} name - Ingredient name
 * @returns {Object} - Created ingredient
 */
const createIngredient = async (userId, name) => {
  const ingredientId = uuidv4();
  const timestamp = Date.now();
  
  const ingredient = {
    ingredientId,
    userId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const params = {
    TableName: tables.INGREDIENTS,
    Item: ingredient
  };
  
  await dynamoDB.put(params);
  return ingredient;
};

/**
 * Get ingredient by ID
 * @param {string} ingredientId - Ingredient ID
 * @returns {Object|null} - Ingredient object or null if not found
 */
const getIngredientById = async (ingredientId) => {
  const params = {
    TableName: tables.INGREDIENTS,
    Key: { ingredientId }
  };
  
  const result = await dynamoDB.get(params);
  return result.Item || null;
};

/**
 * Get ingredients by user ID
 * @param {string} userId - User ID
 * @returns {Array} - List of ingredients
 */
const getIngredientsByUserId = async (userId) => {
  const params = {
    TableName: tables.INGREDIENTS,
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
 * Update ingredient
 * @param {string} ingredientId - Ingredient ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated ingredient
 */
const updateIngredient = async (ingredientId, userId, updateData) => {
  // Check if ingredient exists and belongs to user
  const ingredient = await getIngredientById(ingredientId);
  if (!ingredient) {
    const error = new Error('Ingredient not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (ingredient.userId !== userId) {
    const error = new Error('Not authorized to update this ingredient');
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
    if (key !== 'ingredientId' && key !== 'userId') {
      updateExpression += `, ${key} = :${key}`;
      expressionAttributeValues[`:${key}`] = updateData[key];
    }
  });
  
  const params = {
    TableName: tables.INGREDIENTS,
    Key: { ingredientId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(params);
  return result.Attributes;
};

/**
 * Delete ingredient
 * @param {string} ingredientId - Ingredient ID
 * @param {string} userId - User ID (for authorization)
 * @returns {boolean} - Success status
 */
const deleteIngredient = async (ingredientId, userId) => {
  // Check if ingredient exists and belongs to user
  const ingredient = await getIngredientById(ingredientId);
  if (!ingredient) {
    const error = new Error('Ingredient not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (ingredient.userId !== userId) {
    const error = new Error('Not authorized to delete this ingredient');
    error.statusCode = 403;
    throw error;
  }
  
  const params = {
    TableName: tables.INGREDIENTS,
    Key: { ingredientId }
  };
  
  await dynamoDB.delete(params);
  return true;
};

module.exports = {
  createIngredient,
  getIngredientById,
  getIngredientsByUserId,
  updateIngredient,
  deleteIngredient
}; 