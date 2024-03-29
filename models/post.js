const getDb = require('./../util/database').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

class Post {
    constructor(title, content, imageWebContentLinks, videoUrl, date, id) {
        this.title = title;
        this.content = content;
        this.imageWebContentLinks = imageWebContentLinks;
        this.videoUrl = videoUrl ? videoUrl : null;
        this.date = date;
        this._id = id ? new ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        return db.collection('posts').insertOne(this);
    }

    update() {
        const db = getDb();
        return db.collection('posts').updateOne({ _id: this._id }, { $set: this });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('posts').find().toArray();
    }

    static delete(postId) {
        const db = getDb();
        return db.collection('posts').deleteOne({ _id: new ObjectId(postId) });
    }

    static findById(postId) {
        const db = getDb();
        return db.collection('posts').findOne({ _id: new ObjectId(postId) });
    }
}

module.exports = Post;