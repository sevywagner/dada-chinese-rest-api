const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('./../controllers/auth');
const User = require('./../models/user');

router.put('/signup', [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 letters'),
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, { req }) => {
        return User.findByEmail(value).then((user) => {
            if (user) {
                return Promise.reject('An account with that email already exists');
            }
        });
    }).normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
        console.log(req.body.password);
        if (value !== req.body.password) {
            throw new Error('Passwords must match');
        }
        return true;
    })
], authController.putSignup);

router.post('/login', authController.postLogin);

router.get('/admin-status', authController.getAdminStatus);

module.exports = router;