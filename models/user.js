const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String, 
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);  //Automatically implement the username,hashing, salting , hashed part.

module.exports = mongoose.model("User", userSchema);
