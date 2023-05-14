const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authentication");
const { createMessage, getAllChats, getSingleChat } = require("../controllers/messageController");

const createMessageWithIO = (req, res) => {
  createMessage(req, res, req.io);
};

router
  .route("/")
  .post(authenticateUser, createMessageWithIO)
  .get(authenticateUser,getAllChats);

router.route("/:id").get(authenticateUser, getSingleChat);

module.exports = router;
