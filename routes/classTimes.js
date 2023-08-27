const classTimesController = require('./../controllers/classTimes');
const isAuth = require('./../middleware/is-auth');
const router = require('express').Router();

router.get('/get-class-times', classTimesController.getClassTimes);
router.post('/update-class-times', isAuth, classTimesController.postUpdateClassTimes);

module.exports = router;