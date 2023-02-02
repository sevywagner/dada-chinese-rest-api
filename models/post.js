const getDb = require('./../util/database').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

class Post {
    constructor(title, content, imageUrl, date, id) {
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.date = date;
        this._id = id ? new ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        return db.collection('posts').insertOne(this);
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('posts').find().toArray();
    }

    update() {
        const db = getDb();
        return db.collection('posts').updateOne({ _id: this._id }, { $set: this });
    }
}

module.exports = Post;