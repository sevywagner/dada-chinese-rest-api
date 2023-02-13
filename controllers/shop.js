const User = require('./../models/user');

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