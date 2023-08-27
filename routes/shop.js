const router = require('express').Router();
const shopController = require('./../controllers/shop');
const isAuth = require('./../middleware/is-auth');
const { body } = require('express-validator');

router.post('/update-cart', isAuth, shopController.postUpdateCart);
router.get('/get-cart', isAuth, shopController.getCart);

router.put('/new-order', isAuth, shopController.putNewOrder);
router.put('/new-order-guest', shopController.putNewOrder);

router.post('/orders', isAuth, shopController.getOrders);
router.post('/user-orders', isAuth, shopController.getUserOrders);
router.post('/fetch-order', shopController.getOrder);

module.exports = router;