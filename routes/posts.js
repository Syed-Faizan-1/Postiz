const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "board"
    },
    postImage: String,
    title: String,
    description: String,
});

module.exports = mongoose.model("post", postSchema);