const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "You must provide a username"],
    },
    bio: {
      type: String,
    },
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now(),
    },
    phoneNumber: {
      type: Number,
      unique: [true, "This phone number already exists"],
      required: [true, "You must provide a username"],
    },
    channels: [{ type: mongoose.Types.ObjectId, ref: "Channel" }],
    chats: [{ type: mongoose.Types.ObjectId, ref: "User" }],

    profilePic: {
      type: String,
      default: "download.png",
    },
  },
  { timestamps: true }
);

// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

UserSchema.pre("remove", async function (next) {
  await this.model("Channel").deleteMany({ admin: this._id });
});

// UserSchema.methods.comparePassword = async function (userPassword) {
//   const isMatch = await bcrypt.compare(userPassword, this.password);
//   return isMatch;
// };

module.exports = mongoose.model("User", UserSchema);
