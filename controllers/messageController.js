const Message = require("../models/Message");
const mongoose = require("mongoose");
const createMessage = async (req, res, io) => {
  const newMessage = await Message.create(req.body);

  io.emit("newMessage", newMessage);
  res.status(200).json(newMessage);
};

const getSingleChat = async (req, res) => {
  const chatMessages = await Message.find({
    $or: [
      {
        $and: [
          { recipient: new mongoose.Types.ObjectId(req.params.id) },
          { sender: new mongoose.Types.ObjectId(req.user.userId) },
        ],
      },
      {
        $and: [
          { recipient: new mongoose.Types.ObjectId(req.user.userId) },
          { sender: new mongoose.Types.ObjectId(req.params.id) },
        ],
      },
    ],
  })
    .populate("sender recipient", {
      online: 1,
      lastSeen: 1,
      _id: 1,
      phoneNumber: 1,
      profilePic: 1,
      username: 1,
      isRead:1
    })
    .sort("createdAt");

  res.status(200).json(chatMessages);
};

const getAllChats = async (req, res) => {
  const groupedMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { recipient: new mongoose.Types.ObjectId(req.user.userId) },
          { sender: new mongoose.Types.ObjectId(req.user.userId) },
        ],
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$recipient", req.user.userId] },
            then: "$sender",
            else: "$recipient",
          },
        },
        title: { $first: "$title" },
        createdAt: { $first: "$createdAt" },
      },
    },

    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        title: 1,
        createdAt: 1,
        isRead:1,
        user: {
          online: 1,
          lastSeen: 1,
          _id: 1,
          phoneNumber: 1,
          profilePic: 1,
          username: 1,
        },
      },
    },
  ]);

  res.status(200).json(groupedMessages);
};

module.exports = {
  createMessage,
  getSingleChat,

  getAllChats,
};
