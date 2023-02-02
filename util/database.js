const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) => {
    MongoClient.connect(process.env.MONGO_URI).then((client) => {
        console.log('Connected');
        _db = client.db();
        callback();
    }).catch((err) => {
        console.log(err);
    })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;