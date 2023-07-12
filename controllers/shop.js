const { createTransport } = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('./../models/user');
const Order = require('./../models/order');

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sevywagner@gmail.com',
        pass: process.env.TRANSPORT_PASS
    }
});

exports.postUpdateCart = (req, res, next) => {
    const cart = req.body.cart;

    User.findById(req.userId).then((user) => {
        if (!user) {
            const error = new Error('Could not find user');
            error.statusCode = 404;
            throw error;
        }

        const newUser = new User(user.name, user.email, user.password, user.cart, user._id);

        return newUser.addCart(cart);
    }).then(() => {
        console.log('Updated Cart');
        res.status(201).json({
            message: 'Updated Cart',
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getCart = (req, res, next) => {
    User.findById(req.userId).then((user) => {
        if (!user) {
            const error = new Error('Could not find user');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(user.cart);
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.postConfirmOrder = (req, res, next) => {
    const cartItems = req.body.cartItems;
    let string = '';
    const stringItems = cartItems.forEach((item) => {
        string += `${item.title} ${item.price}`
    });
    console.log(stringItems);

    let email = req.body.email;

    if (req.userId) {
        User.findById(req.userId).then((user) => {
            if (!user) {
                const error = new Error('Could not find user');
                error.statusCode = 404;
                throw error;
            }
            
            email = user.email;
        }).catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }
    
    transport.sendMail({
        to: email,
        from: 'sevywagner@gmail.com',
        subject: 'Order Confirmation from Dada Chinese',
        html: '<p>Your order was successfully placed!</p>'
    });
}

exports.putNewOrder = (req, res, next) => {
    const items = req.body.items;
    const totalPrice = req.body.totalPrice;
    const address = req.body.address;
    
    let user;
    
    if (!req.userId) {
        user = {
            email: req.body.email,
            name: req.body.name,
            _id: null
        }
    } else {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }

        User.findById(req.userId).then((loadedUser) => {
            if (!loadedUser) {
                const error = new Error('Could not find user');
                error.statusCode = 404;
                throw error;
            }
            
            user = loadedUser;
        }).catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }


    const order = new Order(items, totalPrice, address, user.email, user.name, new Date().toDateString(), user._id);
    order.save().then(() => {
        res.status(201).json({
            message: 'Created order'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getOrders = (req, res, next) => {
    Order.fetchOrders().then((orders) => {
        if (!orders) {
            const error = new Error('Error fetching orders');
            error.statusCode = 500;
            throw error;
        }

        if (!req.isAdmin) {
            const error = new Error('You are not authenticated');
            error.statusCode = 401;
            throw error;
        }

        res.status(200).json({
            message: 'Successfully fetched orders',
            orders: orders
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}