const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(authenticateJWT);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.delete('/account', userController.deleteUserAccount);

module.exports = router; 