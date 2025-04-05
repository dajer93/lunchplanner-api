const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateJWT, authController.getCurrentUser);
router.post('/change-password', authenticateJWT, authController.changePassword);

module.exports = router; 