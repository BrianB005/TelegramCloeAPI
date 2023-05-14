const express = require("express");
const { createUser, logout } = require("../controllers/authControler");
const router = express.Router();

router.route("/register").post(createUser);
// router.route("/login").post(login);

router.route("/logout").post(logout);

module.exports = router;
