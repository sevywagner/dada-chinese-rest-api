const router = require('express').Router();
const shopController = require('./../controllers/shop');
const isAuth = require('./../middleware/is-auth');

router.post('/update-cart', isAuth, shopController.postUpdateCart);
router.get('/get-cart', isAuth, shopController.getCart);

router.post('/order-email', isAuth, shopController.postConfirmOrder);
router.put('/new-order', isAuth, shopController.putNewOrder);

module.exports = router;