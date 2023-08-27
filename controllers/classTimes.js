const ClassTime = require('./../models/classTime');

exports.postUpdateClassTimes = (req, res, next) => {
    const classTimes = req.body.classTimes;
    const className = req.body.className;
    const id = req.body.id;

    const times = new ClassTime(classTimes, className, id);
    times.updateClassTimes(classTimes).then((response) => {
        console.log(response);
        res.status(201).json({
            message: 'Successfully replaced class times'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    });
}

exports.getClassTimes = (req, res, next) => {
    ClassTime.fetchClassTimes().then((classTimes) => {
        if (!classTimes) {
            const error = new Error('Could not fetch class times');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            classTimes
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
}