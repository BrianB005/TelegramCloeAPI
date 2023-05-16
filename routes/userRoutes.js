const {
  updateUser,
  deleteAccount,
  getUsers,
  getUser,
} = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authentication");

const router = require("express").Router();
router
  .route("/")
  .put(authenticateUser, updateUser)
  .get(authenticateUser, getUsers)
  .delete(authenticateUser, deleteAccount);

router.route("/:id").get(authenticateUser, getUser);
module.exports = router;
