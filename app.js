const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const cors = require('cors');

const mongoConnect = require('./util/database').mongoConnect;
const postRoutes = require('./routes/posts');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const classTimeRoutes = require('./routes/classTimes');
const contactRoutes = require('./routes/contact');

const app = express();

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

const corsOptions = {
    origin: (origin, cb) => {
        if (origin === process.env.ALLOWED_ORIGIN) {
            cb(null, true);
        } else {
            cb(new Error("origin not allowed"));
        }
    }
}

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(multer({ storage: diskStorage, fileFilter: fileFilter }).array('image', 10));

app.use(postRoutes);
app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);
app.use('/class-times', classTimeRoutes);
app.use('/contact', contactRoutes);
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