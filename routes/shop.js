const router = require('express').Router();
const shopController = require('./../controllers/shop');
const isAuth = require('./../middleware/is-auth');
const { body } = require('express-validator');

router.post('/update-cart', isAuth, shopController.postUpdateCart);
router.get('/get-cart', isAuth, shopController.getCart);

router.post('/order-email', isAuth, shopController.postConfirmOrder);
router.post('/order-email-guest', shopController.postConfirmOrder);
router.put('/new-order', isAuth, shopController.putNewOrder);
router.put('/new-order-guest', shopController.putNewOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/add-credit', isAuth, shopController.postAddCredit);
router.post('/use-credit', isAuth, shopController.postUseCredit);

module.exports = router;