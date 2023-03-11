const getDb = require('./../util/database').getDb;

class Order {
    constructor(items, totalPrice, userEmail, userId) {
        this.items = items;
        this.totalPrice = totalPrice;
        this.userEmail = userEmail;
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
}

module.exports = Order;