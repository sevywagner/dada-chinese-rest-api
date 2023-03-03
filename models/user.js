const mongodb = require('mongodb');
const getDb = require('./../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(name, email, password, cart, resetToken, resetTokenExpiration, id) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.cart = cart;
        this.resetToken = resetToken || null;
        this.resetTokenExpiration = resetTokenExpiration || null;
        this._id = id;
    }

    save() {
        const db = getDb();
        if (this.resetToken) {
            return db.collection('users').updateOne(
                { _id: this._id }, 
                { 
                    $set: { 
                        resetToken: this.resetToken, 
                        resetTokenExpiration: this.resetTokenExpiration 
                    } 
                }
            );
        } else {
            return db.collection('users').insertOne(this);
        }
    }

    addCart(cart) {
        const db = getDb();
        return db.collection('users').updateOne({ email: this.email }, { $set: { cart: cart } });
    }

    updatePassword(password) {
        const db = getDb();
        return db.collection('users').updateOne({ _id: this._id }, { $set: { password: password } });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({ _id: new ObjectId(userId) });
    }

    static findByEmail(email) {
        const db = getDb();
        return db.collection('users').findOne({ email: email });
    }

    static findByToken(token) {
        const db = getDb();
        return db.collection('users').findOne({ resetToken: token });
    }
}

module.exports = User;