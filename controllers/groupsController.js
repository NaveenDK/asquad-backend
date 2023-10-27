const User = require("../models/User");
const Cycle = require("../models/Cycle");
const Goal = require("../models/Goal");
const Group = require("../models/Group");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Create Group
//@route Post /group
//@access Private
const createNewGroup = asyncHandler(async (req, res) => {
  const { users, creatorId, categories, description, groupname } = req.body;
  //confirm data
  if (!users || !creatorId || !categories || !description || !groupname) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const duplicate = await Group.findOne({ groupname }).lean().exec();

  //check for duplicates
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate group" });
  }

  //hash password
  const groupObject = { users, creatorId, categories, description, groupname };
  const group = await Group.create(groupObject);

  if (group) {
    res.status(201).json({ message: `New Group ${group} created` });
  } else {
    res.status(400).json({ message: "invalid user data received" });
  }
});

const getAllGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find();
  if (!groups) {
    return res.status(400).json({ message: "No Groups found" });
  }
  res.json(groups);
});

module.exports = {
  createNewGroup,
  getAllGroups,
};
