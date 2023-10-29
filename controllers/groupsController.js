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

const getGroupDetails = asyncHandler(async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const joinGroup = asyncHandler(async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    console.log("userId is : ");
    console.log(userId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (group.users.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is already a member of this group" });
    }

    Group.findByIdAndUpdate(
      groupId, // Group ID
      { $push: { users: userId } }, // Add the userId to the 'users' array
      { new: true }, // This option ensures that the updated document is returned
      (error, updatedGroup) => {
        if (error) {
          console.error("Error adding user to group:", error);
        } else {
          console.log("User added to group:", updatedGroup);
          // You can send a response here or perform any other necessary actions
          res.status(200).json({
            message: "User added to the group successfully",
            group: updatedGroup,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

const leaveGroup = asyncHandler(async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.users.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is not a member of this group" });
    }

    Group.findByIdAndUpdate(
      groupId,
      { $pull: { users: userId } }, // Use $pull to remove the userId from the 'users' array
      { new: true },
      (error, updatedGroup) => {
        if (error) {
          console.error("Error removing user from group:", error);
        } else {
          console.log("User removed from group:", updatedGroup);
          res.status(200).json({
            message: "User removed from the group successfully",
            group: updatedGroup,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = {
  createNewGroup,
  getAllGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
};
