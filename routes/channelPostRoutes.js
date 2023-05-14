const express = require("express");
const {
  createPost,
  getMyChannelPosts,
  getChannelPosts,
} = require("../controllers/channelPostController");
const { authenticateUser } = require("../middlewares/authentication");

const router = express.Router();

router.route("/").post(createPost).get(authenticateUser, getMyChannelPosts);
router.route("/:id").get(authenticateUser, getChannelPosts);

module.exports = router;
