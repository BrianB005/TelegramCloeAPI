const userTokenPayload = (user) => {
  return {
    username: user.username,
    userId: user._id,
    phoneNumber: user.phoneNumber,
  };
};

module.exports = userTokenPayload;
