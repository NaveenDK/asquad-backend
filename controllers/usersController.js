const User = require("../models/User");
const Cycle = require("../models/Cycle");
const Goal = require("../models/Goal");
const Group = require("../models/Group");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const config = require("config");

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

//GOOGLE REGISTER

// router.post("/google-register-custom-btn",

const googleRegister = asyncHandler(async (req, res) => {
  const { response } = req.body;
  console.log("helloworld");

  //console.log(req.body);
  const googleAccessToken = response.access_token;
  console.log(googleAccessToken);
  axios
    .get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    })
    .then(async (response2) => {
      // console.log(JSON.stringify(response2));

      const email = response2.data.email;
      const name = response2.data.given_name;

      const existingUser = await User.findOne({ email });

      if (existingUser)
        return res.status(400).json({ message: "User already exist!" });

      const result = await User.create({ email, name });
      console.log("result");

      console.log(result);
      const token = jwt.sign(
        {
          _id: result._id,
        },
        config.get("jwtSecret"),
        { expiresIn: "1h" }
      );

      res.status(200).json({ userId: result._id, token });
    })
    .catch((err) => {
      res.status(400).json({ message: "Invalid access token!" });
    });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { response } = req.body;

  const googleAccessToken = response.access_token;

  axios
    .get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    })
    .then(async (response2) => {
      const email = response2.data.email;
      const name = response2.data.given_name;

      const existingUser = await User.findOne({ email });

      if (!existingUser)
        return res.status(400).json({ message: "User doesn't exist!" });

      const token = jwt.sign(
        {
          _id: existingUser._id,
        },
        config.get("jwtSecret"),
        { expiresIn: "1h" }
      );

      res.status(200).json({ userId: existingUser._id, token });
    })
    .catch((err) => {
      res.status(400).json({ message: "Invalid access token!" });
    });
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

// GET route to get user depending on id
const getUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("userId", userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const name = user.name;

    res.status(200).json(name); // Return the cycles in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.get("/:userId", auth, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const admin = await User.findById(userId);

//     if (!admin) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const name = user.name;

//     res.status(200).json(name); // Return the cycles in the response
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

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

//@desc Get user created groups
//@route GET/users
//@access Private
const getUserCreatedGroups = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("userId", userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const groupsbyme = await Group.find({ creatorId: userId });

    // const name = user.name;

    res.status(200).json(groupsbyme); // Return the cycles in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getAllMyGroups = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("userId", userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allgroups = await Group.find({ users: userId });

    // const name = user.name;

    res.status(200).json(allgroups); // Return the cycles in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  googleRegister,
  getUser,
  googleLogin,
  getUserCreatedGroups,
  getAllMyGroups,
};
