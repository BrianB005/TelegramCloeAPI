const Message = require("../models/Message");

const createMessage = async (req, res, io) => {
  req.body.sender = req.user.userId;
  const newMessage = await Message.create(req.body);
  // await User.findByIdAndUpdate(req.body.recipient, {
  //   $addToSet: { chats: req.user.userId },
  // });
  // await User.findByIdAndUpdate(req.user.userId, {
  //   $addToSet: { chats: req.body.recipient },
  // });
  io.emit("newMessage", newMessage);
  res.status(200).json(newMessage);
};

const getSingleChat = async (req, res) => {
  const chatMessages = await Message.find({
    $or: [
      {
        $and: [{ recipient: req.params.id }, { sender: req.user.userId }],
      },
      {
        $and: [{ recipient: req.user.userId }, { sender: req.params.id }],
      },
      {},
    ],
  }).sort("createdAt");

  res.status(200).json(chatMessages);
};

const getAllChats = async (req, res) => {
  const groupedMessages = await Message.aggregate([
    {
      $match: {
        $or: [{ $recipient: req.user.userId }, { $sender: req.user.userId }],
      },
      $match: {},
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

  // const messagess = await Message.populate(groupedMessages, {
  //   path: "",
  //   select: {
  //     online: 1,
  //     lastSeen: 1,
  //     _id: 1,
  //     phoneNumber: 1,
  //     profilePic: 1,
  //     username: 1,
  //   },
  // });

  res.status(200).json(groupedMessages);
};

module.exports = {
  createMessage,
  getSingleChat,

  getAllChats,
};
