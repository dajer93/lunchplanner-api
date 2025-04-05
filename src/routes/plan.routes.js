const express = require('express');
const planController = require('../controllers/plan.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(authenticateJWT);

router.get('/', planController.getMealPlan);
router.delete('/', planController.clearPlan);
router.get('/shopping-list', planController.getShoppingList);
router.get('/:date', planController.getPlanDay);
router.put('/:date', planController.updatePlanDay);
router.delete('/:date', planController.deletePlanDay);

module.exports = router; 