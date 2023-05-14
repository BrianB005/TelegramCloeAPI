const {
  updateUser,
  deleteAccount,
  getUsers,
} = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authentication");

const router = require("express").Router();
router
  .route("/")
  .put(authenticateUser, updateUser)
  .get(getUsers)
  .delete(authenticateUser, deleteAccount);

module.exports = router;
