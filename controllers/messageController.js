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
      $group: {
        _id: null,
        recipient: "$recipient",
        lastMessage: { $last: "$title" },
        timeSent: { $last: "$createdAt" },
        sender: { $last: "$sender" },
      },
      $group: {
        _id: "$sender",

        lastMessage: { $last: "$title" },
        timeSent: { $last: "$createdAt" },
        recipient: { $last: "$recipient" },
        sender: { $last: "$sender" },
      },
    },

    {
      $sort: { timeSent: -1 },
    },
  ]);

  const messagess = await Message.populate(groupedMessages, {
    path: "recipient sender",
    select: {
      online: 1,
      lastSeen: 1,
      _id: 1,
      phoneNumber: 1,
      profilePic: 1,
      username: 1,
    },
  });

  res.status(200).json(messagess);
};

module.exports = {
  createMessage,
  getSingleChat,

  getAllChats,
};
