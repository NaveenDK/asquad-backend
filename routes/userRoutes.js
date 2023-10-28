const express = require("express");
const router = express.Router();
const path = require("path");
const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)

  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router
  .route("/google-register-custom-btn")
  .post(usersController.googleRegister);

router.route("/google-login-custom-btn").post(usersController.googleLogin);

router.route("/:userId").get(auth, usersController.getUser);
router
  .route("/:userId/uc-groups")
  .get(auth, usersController.getUserCreatedGroups);

router.route("/:userId/my-groups").get(auth, usersController.getAllMyGroups);

module.exports = router;
