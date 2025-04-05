const { dynamoDB, tables } = require('../config/db.config');

/**
 * Add or update a day in the meal plan
 * @param {string} userId - User ID
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @param {Array} meals - Array of meal IDs
 * @returns {Object} - Updated meal plan day
 */
const updatePlanDay = async (userId, date, meals) => {
  const timestamp = Date.now();
  
  const planDay = {
    userId,
    date,
    meals,
    updatedAt: timestamp
  };
  
  const params = {
    TableName: tables.MEALPLANS,
    Item: planDay
  };
  
  await dynamoDB.put(params);
  return planDay;
};

/**
 * Get meal plan for a specific day
 * @param {string} userId - User ID
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {Object|null} - Meal plan day or null if not found
 */
const getPlanDay = async (userId, date) => {
  const params = {
    TableName: tables.MEALPLANS,
    Key: {
      userId,
      date
    }
  };
  
  const result = await dynamoDB.get(params);
  return result.Item || null;
};

/**
 * Get meal plan for a user within a date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date in ISO format (inclusive)
 * @param {string} endDate - End date in ISO format (inclusive)
 * @returns {Array} - List of meal plan days
 */
const getPlanRange = async (userId, startDate, endDate) => {
  const params = {
    TableName: tables.MEALPLANS,
    KeyConditionExpression: 'userId = :userId AND #date BETWEEN :startDate AND :endDate',
    ExpressionAttributeNames: {
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':startDate': startDate,
      ':endDate': endDate
    }
  };
  
  const result = await dynamoDB.query(params);
  return result.Items || [];
};

/**
 * Get the entire meal plan for a user
 * @param {string} userId - User ID
 * @returns {Array} - List of all meal plan days
 */
const getUserPlan = async (userId) => {
  const params = {
    TableName: tables.MEALPLANS,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const result = await dynamoDB.query(params);
  return result.Items || [];
};

/**
 * Delete a day from the meal plan
 * @param {string} userId - User ID
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {boolean} - Success status
 */
const deletePlanDay = async (userId, date) => {
  const params = {
    TableName: tables.MEALPLANS,
    Key: {
      userId,
      date
    }
  };
  
  await dynamoDB.delete(params);
  return true;
};

/**
 * Clear the entire meal plan for a user
 * @param {string} userId - User ID
 * @returns {boolean} - Success status
 */
const clearUserPlan = async (userId) => {
  // Get all plan days for the user
  const planDays = await getUserPlan(userId);
  
  // Delete each day
  const deletePromises = planDays.map(day => 
    deletePlanDay(userId, day.date)
  );
  
  await Promise.all(deletePromises);
  return true;
};

module.exports = {
  updatePlanDay,
  getPlanDay,
  getPlanRange,
  getUserPlan,
  deletePlanDay,
  clearUserPlan
}; 