const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/mypinterest")

const userSchema = mongoose.Schema({
    username: String,
    fullName: String,
    email: String,
    password: String,
    profileImage: String,
    contact: Number,
    boards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "board"
        }
    ]
});

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);