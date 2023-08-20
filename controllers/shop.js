const { createTransport } = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('./../models/user');
const Order = require('./../models/order');

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'jingyi.wang@dadachinese.com',
        pass: process.env.TRANSPORT_PASS
    }
});

exports.postUpdateCart = (req, res, next) => {
    const cart = req.body.cart;

    User.findById(req.userId).then((user) => {
        notFoundErrorHandler(user, 'Unable to fetch user');

        const newUser = new User(user.name, user.email, user.password, user.cart, user._id);

        return newUser.addCart(cart);
    }).then(() => {
        console.log('Updated Cart');
        res.status(201).json({
            message: 'Updated Cart',
        });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

exports.getCart = (req, res, next) => {
    User.findById(req.userId).then((user) => {
        notFoundErrorHandler(user, 'Unable to fetch user');

        res.status(200).json({ cart: user.cart });
    }).catch((err) => {
        catchHandler(err, next);
    })
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
            _id: 'Guest'
        }

        const order = new Order(items, totalPrice, address, user.email, user.name, new Date().toDateString(), user._id);
        order.save().then((order) => {
            transport.sendMail({
                to: 'sevywagner@gmail.com',
                from: 'jingyi.wang@dadachinese.com',
                subject: 'Order on Dada Chinese Website',
                html: `<p>${user.name} placed an order, <a href="http://localhost:3000/orders/${order.insertedId.toString()}">click here to view</a></p>`
            });

            transport.sendMail({
                to: user.email,
                from: 'jingyi.wang@dadachinese.com',
                subject: 'Order Confirmation from Dada Chinese',
                html: `<p>Your order was successfully placed! <a href="http://localhost:3000/orders/${order.insertedId.toString()}">Click here to view</a></p>`
            });

            res.status(201).json({
                message: 'Created order'
            });
        }).catch((err) => {
            catchHandler(err, next);
        });
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
            const order = new Order(items, totalPrice, address, user.email, user.name, new Date().toDateString(), user._id);

            return order.save();
        }).then((order) => {
            transport.sendMail({
                to: 'sevywagner@gmail.com',
                from: 'jingyi.wang@dadachinese.com',
                subject: 'Order on Dada Chinese Website',
                html: `<p>${user.name} placed an order, <a href="http://localhost:3000/orders/${order.insertedId.toString()}">click here to view</a></p>`
            });

            transport.sendMail({
                to: user.email,
                from: 'jingyi.wang@dadachinese.com',
                subject: 'Order Confirmation from Dada Chinese',
                html: `<p>Your order was successfully placed! <a href="http://localhost:3000/orders/${order.insertedId.toString()}">Click here to view</a></p>`
            });

            res.status(201).json({
                message: 'Created order'
            });
        }).catch((err) => {
            catchHandler(err, next);
        });
    }
}

exports.getOrders = (req, res, next) => {
    Order.fetchOrders().then((orders) => {
        notFoundErrorHandler(orders, 'Unable to fetch orders');

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
        catchHandler(err, next);
    });
}

exports.getUserOrders = (req, res, next) => {
    Order.fetchUserOrders(req.userId).then((orders) => {
        notFoundErrorHandler(orders, 'Unable to fetch orders');

        res.status(200).json({ orders });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

exports.getOrder = (req, res, next) => {
    const id = req.body.orderId;

    Order.findById(id).then((order) => {
        notFoundErrorHandler(order, 'Unable to fetch order');

        res.status(200).json({ order });
    }).catch((err) => {
        catchHandler(err, next);
    })
}

const catchHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

const notFoundErrorHandler = (item, message) => {
    if (!item) {
        const error = new Error(message);
        error.statusCode = 404;
        throw error;
    }
}