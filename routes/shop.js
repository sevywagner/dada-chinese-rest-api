const router = require('express').Router();
const shopController = require('./../controllers/shop');
const isAuth = require('./../middleware/is-auth');

router.post('/update-cart', isAuth, shopController.postUpdateCart);
router.get('/get-cart', isAuth, shopController.getCart);

module.exports = router;