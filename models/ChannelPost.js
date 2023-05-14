const mongoose = require("mongoose");

const ChannelPostSchema = new mongoose.Schema(
  {
    title: {
      required: [true, "You must provide a title!"],
      type: String,
    },
    channel: {
      type: mongoose.Types.ObjectId,
      ref: "Channel",
      required: [true, "You must provide a channel"],
    },
    images: [{ type: String }],
    link: {
      type: String,
    },
    members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChannelPost", ChannelPostSchema);
