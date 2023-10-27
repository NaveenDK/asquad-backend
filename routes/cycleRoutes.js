const express = require("express");
const router = express.Router();
const path = require("path");
const cycleController = require("../controllers/cyclesController");

router.route("/").post(cycleController.createNewCycle);

module.exports = router;
