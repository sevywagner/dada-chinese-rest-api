const getDb = require('./../util/database').getDb;

class Order {
    constructor(items, totalPrice, address, userEmail, name, userId) {
        this.items = items;
        this.totalPrice = totalPrice;
        this.address = address;
        this.userEmail = userEmail;
        this.name = name;
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