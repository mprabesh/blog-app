const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minLength: 3, unique: true },
  name: { type: String, required: true, minLength: 3 },
  passwordHash: { type: String, required: true },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, returnObj) => {
    returnObj.id = returnObj._id.toString();
    delete returnObj._id;
    delete returnObj.__v;
    delete returnObj.passwordHash;
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
