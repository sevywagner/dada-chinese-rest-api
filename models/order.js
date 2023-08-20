const getDb = require('./../util/database').getDb;
const mongo = require('mongodb');

class Order {
    constructor(items, totalPrice, address, userEmail, name, date, userId) {
        this.items = items;
        this.totalPrice = totalPrice;
        this.address = address;
        this.userEmail = userEmail;
        this.name = name;
        this.date = date;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        return db.collection('orders').insertOne(this);
    }

    static fetchOrders() {
        const db = getDb();
        return db.collection('orders').find().toArray();
    }

    static fetchUserOrders(userId) {
        const db = getDb();
        return db.collection('orders').find({ userId: new mongo.ObjectId(userId) }).toArray();
    }

    static findById(orderId) {
        const db = getDb();
        return db.collection('orders').findOne({ _id: new mongo.ObjectId(orderId) });
    }
}

module.exports = Order;