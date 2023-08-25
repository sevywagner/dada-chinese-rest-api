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

    static fetchOrders(pageNum, perPage) {
        const db = getDb();
        return db.collection('orders').find().skip((pageNum - 1) * perPage).limit(perPage).toArray();
    }

    static fetchUserOrders(userId, skipNumber, perPage) {
        const db = getDb();
        return db.collection('orders').find({ userId: new mongo.ObjectId(userId) }).skip(skipNumber).limit(perPage).toArray();
    }

    static findById(orderId) {
        const db = getDb();
        return db.collection('orders').findOne({ _id: new mongo.ObjectId(orderId) });
    }

    static fetchAllUserOrders(userId) {
        const db = getDb();
        return db.collection('orders').find({ userId: new mongo.ObjectId(userId) }).toArray();
    }
}

module.exports = Order;