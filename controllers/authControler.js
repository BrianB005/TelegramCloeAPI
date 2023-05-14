const User = require("../models/User");
const StatusCodes = require("http-status-codes");
const { userTokenPayload, createJWT } = require("../utils");
const CustomError = require("../errors");

const createUser = async (req, res) => {
  let user = await User.find({ phoneNumber: req.body.phoneNumber });
  if (user.length === 0) {
    user = await User.create(req.body);
  }
  const tokenUser = userTokenPayload(user);
  const token = createJWT({ payload: tokenUser });

  res.status(200).json({ user, token });
};

const logout = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "user logged out successfully.!" });
};

module.exports = {
  createUser,

  logout,
};
