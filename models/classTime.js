const getDb = require('./../util/database').getDb;
const mongo = require('mongodb');

class ClassTime {
    constructor(classTimes, className, id) {
        this.classTimes = classTimes;
        this.className = className;
        this._id = id || null;
    }

    updateClassTimes(classTimes) {
        const db = getDb();
        return db.collection('classTimes').updateOne({ _id: new mongo.ObjectId(this._id) }, { $set: { classTimes } })
    }

    static fetchClassTimes() {
        const db = getDb();
        return db.collection('classTimes').find().toArray();
    }
}

module.exports = ClassTime;