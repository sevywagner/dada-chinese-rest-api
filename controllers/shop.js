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

        res.status(200).json({ cart: user.cart, credit: user.credit });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.postConfirmOrder = (req, res, next) => {
    // const cartItems = req.body.cartItems;
    // let string = '';
    // const stringItems = cartItems.forEach((item) => {
    //     string += `${item.title} ${item.price}`
    // });
    console.log(req.body.email);

    if (req.userId) {
        User.findById(req.userId).then((user) => {
            if (!user) {
                const error = new Error('Could not find user');
                error.statusCode = 404;
                throw error;
            }
        
            transport.sendMail({
                to: user.email,
                from: 'sevywagner@gmail.com',
                subject: 'Order Confirmation from Dada Chinese',
                html: '<p>Your order was successfully placed!</p>'
            });
        }).catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    } else {
        transport.sendMail({
            to: req.body.email,
            from: 'sevywagner@gmail.com',
            subject: 'Order Confirmation from Dada Chinese',
            html: '<p>Your order was successfully placed!</p>'
        });
    }
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
            res.status(201).json({
                message: 'Created order'
            });
        }).catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
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
        }).then(() => {
            transport.sendMail({
                to: '',
                from: '',
                subject: 'Order on Dada Chinese Website',
                html: `<p>${user.name} placed an order, <a>click here to view</a></p>`
            });

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

exports.postAddCredit = (req, res, next) => {
    const credit = req.body.credit;

    User.findById(req.userId).then((targetUser) => {
        if (!targetUser) {
            const error = new Error('This token does not belong to a user');
            error.statusCode = 404;
            throw error;
        }

        const newUser = new User(
            targetUser.name, 
            targetUser.email, 
            targetUser.password, 
            targetUser.cart, 
            targetUser.resetToken, 
            targetUser.resetTokenExpiration, 
            targetUser.credit,
            targetUser._id
        );

        return newUser.updateCredit(parseInt(credit) + parseInt(targetUser.credit));
    }).then(() => {
        res.status(200).json({
            message: 'Success'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.postUseCredit = (req, res, next) => {
    const amountUsed = req.body.creditUsed;

    User.findById(req.userId).then((targetUser) => {
        if (!targetUser) {
            const error = new Error('This token does not belong to a user');
            error.statusCode = 404;
            throw error;
        }

        const newUser = new User(
            targetUser.name, 
            targetUser.email, 
            targetUser.password, 
            targetUser.cart, 
            targetUser.resetToken, 
            targetUser.resetTokenExpiration, 
            targetUser.credit,
            targetUser._id
        );

        return newUser.updateCredit(parseInt(targetUser.credit) - parseInt(amountUsed));
    }).then(() => {
        res.status(200).json({
            message: 'Success'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}