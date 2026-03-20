const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, changePassword, getBudgets, saveBudgets } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/budgets', protect, getBudgets);
router.put('/budgets', protect, saveBudgets);

module.exports = router;
