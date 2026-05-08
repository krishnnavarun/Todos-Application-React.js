const express = require('express');
const { registerUser, loginUser, logoutUser, updateProfileImage } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticateToken, logoutUser);
router.put('/profile-image', authenticateToken, updateProfileImage);

module.exports = router;