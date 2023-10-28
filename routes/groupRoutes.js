const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const groupsController = require("../controllers/groupsController");

router
  .route("/")
  .post(groupsController.createNewGroup)
  .get(groupsController.getAllGroups);

router.route("/:groupId").get(auth, groupsController.getGroupDetails);
router.route("/:groupId/join").post(auth, groupsController.joinGroup);
router.route("/:groupId/leave").post(auth, groupsController.leaveGroup);
module.exports = router;
