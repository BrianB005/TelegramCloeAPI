const ChannelPost = require("../models/ChannelPost");
const User = require("../models/User");
const createPost = async (req, res) => {
  await ChannelPost.create(req.body);
  res.status(200).json("Post created successfully!");
};

const getMyChannelPosts = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const posts = await Promise.all(
    user?.channels?.map((channel) =>
      ChannelPost.find({ channel })
        .populate("channel", {
          name: 1,
          _id: 1,
        })
        .sort("-createdAt")
        .limit(1)
    )
  );
  res.status(200).json(posts.flat());
};

const getChannelPosts = async (req, res) => {
  const posts = await ChannelPost.find({ channel: req.params.id });

  res.status(200).json(posts);
};

module.exports = {
  getChannelPosts,
  getMyChannelPosts,
  createPost,
};
