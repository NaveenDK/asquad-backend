const User = require("../models/User");
const Cycle = require("../models/Cycle");
const Goal = require("../models/Goal");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Create Cycle
//@route Post /cycle
//@access Private
const createNewCycle = asyncHandler(async (req, res) => {
  const { startDate, endDate, group, cycleMembers } = req.body;

  if (!startDate || !endDate || !group || !cycleMembers) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const cycleObject = { startDate, endDate, group, cycleMembers };

  //create and store new cycle
  const cycle = await Cycle.create(cycleObject);

  if (cycle) {
    res.status(201).json({ message: `New cycle created` });
  } else {
    res.status(400).json({ message: "invalid cycle data received" });
  }
});

module.exports = {
  createNewCycle,
};
