const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
    // id is created by default by mLab
    name: String,
    age: Number
});

module.exports = mongoose.model('Author', authorSchema);