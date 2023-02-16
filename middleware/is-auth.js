const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error('No auth header');
        error.statusCode = 401;
        throw error;
    };

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch (error) {
        error.statusCode = 500;
        throw error;
    }

    if (!decodedToken) {
        const error = new Error('Invalid token');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    console.log(decodedToken);
    req.isAdmin = decodedToken.userId === process.env.ADMIN_ID ? true : false;
    next();
}