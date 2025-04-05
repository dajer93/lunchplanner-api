const express = require('express');
const mealController = require('../controllers/meal.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(authenticateJWT);

router.get('/', mealController.getMeals);
router.post('/', mealController.createMeal);
router.get('/:mealId', mealController.getMealById);
router.put('/:mealId', mealController.updateMeal);
router.delete('/:mealId', mealController.deleteMeal);

module.exports = router; 