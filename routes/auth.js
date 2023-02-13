const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('./../controllers/auth');
const User = require('./../models/user');

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, { req }) => {
        return User.findByEmail(value).then((user) => {
            if (user) {
                return Promise.reject('An account with that email already exists');
            }
        });
    }).normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must match');
        }
        return true;
    })
], authController.putSignup);

router.post('/login', authController.postLogin);

router.get('/admin-status', authController.getAdminStatus);

module.exports = router;