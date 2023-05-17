const Channel = require("../models/Channel");
const User = require("../models/User");
const ChannelPost = require("../models/ChannelPost");

const { authorizeUser } = require("../utils");

const createChannel = async (req, res) => {
  req.body.admin = req.user.userId;
  const channel = await Channel.create(req.body);

  await channel.updateOne(
    {
      $push: { members: req.user.userId },
    },
    { new: true }
  );

  await ChannelPost.create({ title: "Channel created", channel: channel._id });

  res.status(200).json("Channel created successfully!");
};

const deleteChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  const currentUser = await User.findById(req.user.userId);
  if (channel) {
    const userIDs = channel.members;

    const updatePromises = userIDs.map((userId) =>
      User.findByIdAndUpdate(userId, { $pull: { channels: channel._id } })
    );
    await Promise.all(updatePromises);
    authorizeUser(currentUser, channel.admin);
    await channel.remove();
    res.status(200).json("Channel deleted successsfully!");
  } else {
    res.status(200).json("Channel not found!");
  }
};

const updateChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  const currentUser = await User.findById(req.user.userId);
  if (channel) {
    authorizeUser(currentUser, channel.admin);
    await channel.updateOne(req.body);
    res.status(200).json("Channel deleted successsfully!");
  } else {
    res.status(200).json("Channel not found!");
  }
};
const joinChannel = async (req, res) => {
  const currentUser = await User.findById(req.user.userId);

  const channel = await Channel.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { members: req.user.userId },
    },
    { new: true }
  );

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }
  await currentUser.updateOne({ $addToSet: { channels: channel._id } });
  res.status(200).json("Joined channel successfully");
};
const leaveChannel = async (req, res) => {
  const currentUser = await User.findById(req.user.userId);

  const channel = await Channel.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { members: req.user.userId },
    },
    { new: true }
  );

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  await currentUser.updateOne({ $pull: { channels: channel._id } });
  res.status(200).json("Left channel successfully");
};
const getChannels = async (req, res) => {
  const channels = await Channel.find({});
  res.status(200).json(channels);
};

const searchChannels = async (req, res) => {
  const query = req.query.channel;
  const channels = await Channel.find({
    name: { $regex: query, $options: "i" },
  });

  res.status(200).json(channels);
};
module.exports = {
  createChannel,
  updateChannel,
  deleteChannel,
  joinChannel,
  leaveChannel,
  getChannels,
  searchChannels
};
