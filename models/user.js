const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    CodeforcesHandle: String,
    CurrentRating: Number,
    MaxRating: Number,
    Rank: String,
    MaxRank: String,
    Organization: String
});

module.exports = mongoose.model('User', userSchema);
