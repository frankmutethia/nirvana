const express = require('express');
const authController = require('../controllers/authController');
const { signinScheme } = require('../middlewares/validator');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Signup
router.post('/signup', authController.signup);

// Signin with input validation
router.post('/signin', (req, res, next) => {
	const { error } = signinScheme.validate(req.body);
	if (error) return res.status(400).json({ success: false, message: error.details[0].message });
	next();
}, authController.signin);

//Sign out
router.post('/signout', authController.signout);
router.patch('/send-verification-code', authController.sendVerificationEmail);
router.post('/verify-email', authController.verifyEmailCode);

// Example protected route to check token
router.get('/me', verifyToken, (req, res) => {
	return res.status(200).json({ success: true, user: req.user });
});

module.exports = router;