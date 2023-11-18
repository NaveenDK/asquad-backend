const express = require("express");
const router = express.Router();
const path = require("path");
const cycleController = require("../controllers/cyclesController");
const auth = require("../middleware/auth");

router.route("/").post(auth, cycleController.createNewCycle);

module.exports = router;
