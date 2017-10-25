var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
    title: String,
    fields: [],
    votes: [],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    dateCreated : String
});

module.exports = mongoose.model("Poll", pollSchema);