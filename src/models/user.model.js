const { v4: uuidv4 } = require('uuid');
const { dynamoDB, tables } = require('../config/db.config');
const { hashPassword } = require('../utils/password.utils');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} - Created user
 */
const createUser = async (userData) => {
  const { email, password, name } = userData;
  
  // Check if user with the email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  const userId = uuidv4();
  const timestamp = Date.now();
  
  const user = {
    userId,
    email,
    passwordHash: hashedPassword,
    name,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const params = {
    TableName: tables.USERS,
    Item: user
  };
  
  await dynamoDB.put(params);
  
  // Don't return the password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get a user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} - User object or null if not found
 */
const getUserById = async (userId) => {
  const params = {
    TableName: tables.USERS,
    Key: { userId }
  };
  
  const result = await dynamoDB.get(params);
  
  if (!result.Item) {
    return null;
  }
  
  // Don't return the password hash
  const { passwordHash, ...userWithoutPassword } = result.Item;
  return userWithoutPassword;
};

/**
 * Get a user by email (for authentication)
 * @param {string} email - User email
 * @returns {Object|null} - User object including password hash or null if not found
 */
const getUserByEmail = async (email) => {
  const params = {
    TableName: tables.USERS,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  
  const result = await dynamoDB.query(params);
  
  if (!result.Items || result.Items.length === 0) {
    return null;
  }
  
  return result.Items[0];
};

/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user
 */
const updateUser = async (userId, updateData) => {
  // Get the current user
  const user = await getUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Prepare update expression
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': Date.now()
  };
  
  // Add fields to update
  Object.keys(updateData).forEach(key => {
    if (key !== 'userId' && key !== 'email' && key !== 'passwordHash') {
      updateExpression += `, ${key} = :${key}`;
      expressionAttributeValues[`:${key}`] = updateData[key];
    }
  });
  
  const params = {
    TableName: tables.USERS,
    Key: { userId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(params);
  
  // Don't return the password hash
  const { passwordHash, ...userWithoutPassword } = result.Attributes;
  return userWithoutPassword;
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {boolean} - Success status
 */
const updatePassword = async (userId, newPassword) => {
  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);
  
  const params = {
    TableName: tables.USERS,
    Key: { userId },
    UpdateExpression: 'SET passwordHash = :passwordHash, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':passwordHash': hashedPassword,
      ':updatedAt': Date.now()
    }
  };
  
  await dynamoDB.update(params);
  return true;
};

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {boolean} - Success status
 */
const deleteUser = async (userId) => {
  const params = {
    TableName: tables.USERS,
    Key: { userId }
  };
  
  await dynamoDB.delete(params);
  return true;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  updatePassword,
  deleteUser
}; 