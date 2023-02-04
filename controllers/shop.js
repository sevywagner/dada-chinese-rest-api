const User = require('./../models/user');

exports.postUpdateCart = (req, res, next) => {
    const cart = req.body.cart;
    console.log(req.user.name);

    req.user.addCart(cart).then(() => {
        console.log('Updated Cart');
        res.status(201).json({
            message: 'Updated Cart',
        });
    }).catch((err) => {
        res.status(400).json(err);
    });
}

exports.getCart = (req, res, next) => {
    res.status(201).json(req.user.cart);
}