const express = require('express');
const ingredientController = require('../controllers/ingredient.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(authenticateJWT);

router.get('/', ingredientController.getIngredients);
router.post('/', ingredientController.createIngredient);
router.get('/:ingredientId', ingredientController.getIngredientById);
router.put('/:ingredientId', ingredientController.updateIngredient);
router.delete('/:ingredientId', ingredientController.deleteIngredient);

module.exports = router; 