const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user')
const postRoutes = require('./routes/posts');
const shopRoutes = require('./routes/shop');

const app = express();

const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
});

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use((req, res, next) => {
    User.findById('63ddfd0a91de1ba7d8bb08d5').then((user) => {
        // console.log('middleware' + user.name);
        req.user = new User(user.name, user.email, user.password, user.cart, user._id);
        next();
    }).catch((err) => {
        console.log(err)
    });
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(postRoutes);
app.use('/shop', shopRoutes);

mongoConnect(() => {
    app.listen(process.env.PORT || 8080);
});