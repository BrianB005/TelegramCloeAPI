const mongoose = require("mongoose");

// message Schema

const MessageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: [200, "Message is too long"],
    },
    sender: {
      type: mongoose.Types.ObjectId,
      required: [true, "Sender can't be empty"],
      ref: "User",
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver can't be empty"],
    },
    isRead: { type: Boolean, default: false },
    images: {
      type: [{ type: String }],
    },
  },
  { timestamps: true }
);
MessageSchema.index({ sender: 1, recipient: 1 });

module.exports = mongoose.model("Message", MessageSchema);
