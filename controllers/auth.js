const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.putSignup = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User(name, email, hashedPassword, { items: [], totalPrice: 0.00 });
        return user.save();
    }).then((result) => {
        res.status(201).json({
            message: 'User has been created'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })  
}

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input');
        error.statusCode = 422;
        throw error;
    }

    let loadedUser;
    const email = req.body.email;
    const password = req.body.password;

    User.findByEmail(email).then((user) => {
        if (!user) {
            const error = new Error('A user with that email was not found');
            error.statusCode = 422;
            throw error;
        }
        
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    }).then((isEqual) => {
        if (!isEqual) {
            const error = new Error('Password is not valid');
            error.statusCode = 422;
            throw error;
        }

        const token = jwt.sign({
            email: email,
            userId: loadedUser._id.toString()
        }, process.env.SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token,
            userId: loadedUser._id.toString(),
            expiration: new Date().getTime() + 3600000
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getAdminStatus = (req, res, next) => {
    User.findById(req.userId).then((user) => {
        if (!user) {
            const error = new Error('Could not find user');
            error.statusCode = 404;
            throw error;
        }

        if (user.isAdmin) {  
            return res.status(200).json({
                isAdmin: true
            });
        }

        res.status(404).json({
            isAdmin: false
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}