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

const deleteGroup = asyncHandler(async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const groups = await Group.find({ creatorId: userId });

    function getGroupById(groupId) {
      for (const group of groups) {
        if (group._id.toString() === groupId.toString()) {
          return group; // Return the group that matches the groupId
        }
      }

      return null; // Return null if no matching group is found
    }

    const foundGroup = getGroupById(groupId);

    if (foundGroup.creatorId.toString() == userId) {
      try {
        // groups.deleteOne({ groupId: groupId });

        Group.find({ _id: groupId }).remove().exec();

        res.json({ msg: "successfully deleted" });
      } catch (e) {
        console.log(e);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

const getAllMembers = asyncHandler(async (req, res) => {
  //const { userId, groupId } = req.body;
  const { groupId } = req.params;

  try {
    // Find the group by ID and populate the 'users' field
    const group = await Group.findById(groupId).populate("users");

    // Check if the group exists
    if (!group) {
      console.log("Group not found");
      return null;
    }

    // Access the users array in the populated group object
    const usersInGroup = group.users;

    // Log or return the users in the group
    console.log("Users in the group:", usersInGroup);
    let memberNames = usersInGroup
      .map((obj) => obj["name"])
      .filter((value) => value !== undefined);
    console.log(memberNames);
    // You can also return the users array if needed
    // console.log(usersInGroup);
    res.status(200).json(memberNames);
    // return usersInGroup;
  } catch (error) {
    console.error("Error fetching users in group:", error);
    throw error;
  }
});

module.exports = {
  deleteGroup,
  createNewGroup,
  getAllGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  getAllMembers,
};
