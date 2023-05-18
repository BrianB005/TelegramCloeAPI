const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      required: [true, "You must provide a channel name!"],
      type: String,
      unique: [true, "This channel name has already been taken!"],
    },
    admin: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "You must provide a channel admin"],
    },
    icon: {
      type: String,
      default: "people.png",
    },
    bio: {
      type: String,
    },
    link: {
      type: String,
    },
    members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", ChannelSchema);
