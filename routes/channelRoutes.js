const express = require("express");
const { authenticateUser } = require("../middlewares/authentication");
const {
  createChannel,
  updateChannel,
  joinChannel,
  leaveChannel,
  deleteChannel,

  searchChannels,
} = require("../controllers/channelController");

const router = express.Router();
router
  .route("/")
  .post(authenticateUser, createChannel)
  .get(authenticateUser, searchChannels);
router.route("/:id").put(authenticateUser, updateChannel);
router.route("/:id").delete(authenticateUser, deleteChannel);
router.route("/join/:id").put(authenticateUser, joinChannel);
router.route("/leave/:id").put(authenticateUser, leaveChannel);

module.exports = router;
