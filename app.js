const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const cors = require('cors');
const { google } = require('googleapis');

const mongoConnect = require('./util/database').mongoConnect;
const postRoutes = require('./routes/posts');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, 'Blog-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(multer({ storage: diskStorage, fileFilter: fileFilter }).single('image'));

app.use(postRoutes);
app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.statusCode).json({
        error: error.message,
        statusCode: error.statusCode
    });
});

mongoConnect(() => {
    app.listen(process.env.PORT || 8080);
});