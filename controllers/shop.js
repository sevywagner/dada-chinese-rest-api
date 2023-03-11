const { createTransport } = require('nodemailer');
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
}

exports.putNewOrder = (req, res, next) => {
    const items = req.body.items;
    const totalPrice = req.body.totalPrice;

    User.findById(req.userId).then((user) => {
        if (!user) {
            const error = new Error('Could not find user');
            error.statusCode = 404;
            throw error;
        }
        
        const order = new Order(items, totalPrice, user.email, user._id);
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
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}