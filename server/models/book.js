const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    // id is created by default by mLab
    name: String,
    genre: String,
    authorId: String
});

module.exports = mongoose.model('Book', bookSchema);