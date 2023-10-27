const express = require("express");
const router = express.Router();
const path = require("path");
const groupsController = require("../controllers/groupsController");

router
  .route("/")
  .post(groupsController.createNewGroup)
  .get(groupsController.getAllGroups);

module.exports = router;
