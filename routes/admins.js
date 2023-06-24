const { check, validationResult } = require("express-validator");

const router = require("express").Router();
const auth = require("../middleware/auth");
const Admin = require("../models/admin.model.js");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
//@route POST api/admins
//@desc Register an admin
//@access Public
router.post(
  "/",

  [
    check("name", "Please add a name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a pwd with 6 or more characters ").isLength(
      { min: 6 }
    ),
  ],
  async (req, res) => {
    // res.send("Register an admin");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //res.send("passed");

    const { name, email, password, confirmpassword } = req.body;

    try {
      let admin = await Admin.findOne({ email });

      if (admin) {
        return res.status(400).json({ error: "Email already registered" });
      }

      admin = new Admin({
        name,
        email,
        password,
        confirmpassword,
      });

      const salt = await bcrypt.genSalt(10);

      admin.password = await bcrypt.hash(password, salt);
      admin.confirmpassword = await bcrypt.hash(confirmpassword, salt);

      await admin.save();
      const payload = {
        admin: {
          id: admin.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token, adminId: admin._id });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route POST api/admins/login
//@desc Login an admin
//@access Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const payload = {
        admin: {
          id: admin.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token, adminId: admin._id });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);
// POST route for adding a cycle for a specific admin
router.post("/:adminId", auth, async (req, res) => {
  try {
    const { adminId } = req.params;

    const { startDate, endDate, users } = req.body;

    const newCycle = {
      startDate,
      endDate,
      users,
    };

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.cycles.push(newCycle);

    await admin.save();

    res.status(201).json(newCycle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to retrieve all cycles for a specific admin
router.get("/:adminId/cycles", auth, async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const cycles = admin.cycles;

    res.status(200).json(cycles); // Return the cycles in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a cycle
router.delete("/:adminId/cycles/:cycleId", auth, async (req, res) => {
  const { adminId, cycleId } = req.params;

  try {
    const admin = await Admin.findOneAndUpdate(
      { "cycles._id": cycleId },
      { $pull: { cycles: { _id: cycleId } } },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: "Cycle not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

//Get a cycle
// Get a cycle for a specific admin
router.get("/:adminId/cycles/:cycleId", auth, async (req, res) => {
  const { adminId, cycleId } = req.params;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const cycle = admin.cycles.find(
      (cycle) => cycle._id.toString() === cycleId
    );

    if (!cycle) {
      return res.status(404).json({ error: "Cycle not found" });
    }

    res.json(cycle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update a cycle
router.put("/:adminId/cycles/:cycleId", auth, async (req, res) => {
  const { adminId, cycleId } = req.params;
  const { startDate, endDate, users } = req.body;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const cycleIndex = admin.cycles.findIndex(
      (cycle) => cycle._id.toString() === cycleId
    );

    if (cycleIndex === -1) {
      return res.status(404).json({ error: "Cycle not found" });
    }

    admin.cycles[cycleIndex].startDate = startDate;
    admin.cycles[cycleIndex].endDate = endDate;
    admin.cycles[cycleIndex].users = users;

    await admin.save();

    res.json(admin.cycles[cycleIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});
module.exports = router;
