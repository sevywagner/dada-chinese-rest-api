const router = require('express').Router();
const shopController = require('./../controllers/shop');

router.post('/update-cart', shopController.postUpdateCart);
router.get('/get-cart', shopController.getCart);

module.exports = router;