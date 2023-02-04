const mongodb = require('mongodb');
const getDb = require('./../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(name, email, password, cart, id) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addCart(cart) {
        const db = getDb();
        return db.collection('users').updateOne({ email: this.email }, { $set: { cart: cart } });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({ _id: new ObjectId(userId) });
    }
}

module.exports = User;