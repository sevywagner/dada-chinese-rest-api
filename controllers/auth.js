const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createTransport } = require('nodemailer');

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sevywagner@gmail.com',
        pass: process.env.TRANSPORT_PASS
    }
});

exports.putSignup = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors);

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
        transport.sendMail({
            to: email,
            from: 'sevywagner@gmail.com',
            subject: 'Successfully Signed Up',
            html: '<h1>You successfully signed up for dada chinese.</h1>'
        });
    }).catch((err) => {
        catchHandler(err, next);
    })  
}

exports.postLogin = (req, res, next) => {
    let loadedUser;
    const email = req.body.email;
    const password = req.body.password;

    User.findByEmail(email).then((user) => {
        if (!user) {
            const error = new Error('A user with that email was not found');
            error.statusCode = 404;
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
        catchHandler(err, next);
    })
}

exports.postForgotPassword = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);
    validationErrorHandler(errors);

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            const error = new Error('Error creating a token');
            error.statusCode = 500;
            throw error;
        }

        const token = buffer.toString('hex');
        const tokenExpiration = new Date().getTime() + 3600000;

        User.findByEmail(email).then((user) => {
            const newUser = new User(user.name, user.email, user.password, user.cart, token, tokenExpiration, user._id);

            return newUser.save();
        }).then((result) => {
            transport.sendMail({
                to: email,
                from: 'sevywagner@gmail.com',
                secure: true,
                html: `<p>Click <a href="http://localhost:3000/dada-chinese/reset-password/${token}">here</a> to reset password</p>`
            });
            res.status(200).json({
                message: 'Successfully sent the reset link to your email. It expires in 1 hour.'
            });
        }).catch((err) => {
            catchHandler(err, next);
        });
    });
}

exports.postChangePassword = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors);

    const password = req.body.password;
    const token = req.body.token;
    let targetUser;

    User.findByToken(token).then((user) => {
        if (!user) {
            const error = new Error('This token does not belong to a user');
            error.statusCode = 404;
            throw error;
        }

        if (user.resetTokenExpiration - new Date().getTime() < 0) {
            const error = new Error('Token has expired, please get a new link');
            error.statusCode = 422;
            throw error;
        }

        targetUser = user;
        return bcrypt.hash(password, 12);
    }).then((hash) => {
        const newUser = new User(targetUser.name, targetUser.email, hash, targetUser.cart, targetUser.resetToken, targetUser.resetTokenExpiration, targetUser._id);

        return newUser.updatePassword(hash);
    }).then((result) => {
        console.log(result);
        res.status(200).json({
            message: 'Successfully updated your password'
        });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

const catchHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

const validationErrorHandler = (errors) => {
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }
}