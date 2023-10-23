const User = require("../models/User");
const Cycle = require("../models/Cycle");
const Goal = require("../models/Goal");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route Get /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});
//@desc Create new user
//@route Post /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { name, password, email } = req.body;

  //confirm data

  if (!name || !password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  //check for duplicate
  const duplicate = await User.findOne({ email }).lean().exec();
  console.log("duplicate:: " + JSON.stringify(duplicate));

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate name" });
  }
  //Hash password
  const hashedPwd = await bcrypt.hash(password, 10); //salt rounds

  const userObject = { name, email, password: hashedPwd };

  //Create and store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New User ${name} created` });
  } else {
    res.status(400).json({ message: "invalid user data received" });
  }
});
//@desc Update user
//@route PATCH/users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, name, email, password } = req.body;

  //confirm data
  if (!id || !name || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.name = name;
  user.email = email;
  if (password) {
    //hashpwd
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});
//@desc Delete user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User Id required" });
  }
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
