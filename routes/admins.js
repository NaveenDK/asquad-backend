const { check, validationResult } = require("express-validator");

const router = require("express").Router();
const auth = require("../middleware/auth");
const axios = require("axios")
const Admin = require("../models/admin.model.js");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const nodemailer = require("nodemailer");
const {OAuth2Client}  = require('google-auth-library')
 
// email config
var password = process.env.PASSWORD;

//var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
var transporter = nodemailer.createTransport(
  "smtps://teamasquad3%40gmail.com:" + password + "@smtp.gmail.com"
);



async function verify(client_id, jwtToken) {
  const client = new OAuth2Client(client_id);
  // Call the verifyIdToken to
  // varify and decode it
  const ticket = await client.verifyIdToken({
      idToken: jwtToken,
      audience: client_id,
  });
  // Get the JSON with all the user info
  const payload = ticket.getPayload();
  // This is a JSON object that contains
  // all the user info
  ///console.log("payload: " + JSON.stringify(payload))
  return payload;
}

//Google - login
router.post("/google-login", async (req, res) => {

  if (req.body.response) {
    const {response} = req.body;
  // console.log("I am here and got the token right: " + JSON.stringify(response))
   verify(response.clientId,response.credential).then(async x=>{
   // console.log("this is x: " + JSON.stringify(x))
    const email = x.email;
    const existingUser = await Admin.findOne({email})

    console.log("existing User: " + existingUser)
            if (!existingUser) {
              return res.status(400).json({message: "User doesn't exist"})
            }
            const payload = {
              admin: {
                _id: existingUser._id,
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
                res.status(200).json({ token, adminId: existingUser._id });
              }
            );
        })
        .catch(err => {
            res
                .status(400)
                .json({message: "Invalid access token!"})
        })
 
} else {
  console.log("nothing happens")
}
  
});



//google login - custom btn
router.post("/google-login-custom-btn", async (req, res) => {

  
  const {response} = req.body;
  

 const googleAccessToken=response.access_token

  axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
  headers: {
      "Authorization": `Bearer ${googleAccessToken}`
  }
})
  .then(async response2 => {
      
      const email = response2.data.email;
      const name = response2.data.given_name;
  

      const existingUser = await Admin.findOne({email})
   
      if (!existingUser) 
          return res.status(400).json({message: "User doesn't exist!"})

       

      const token = jwt.sign({
         
          _id: existingUser._id
      }, config.get("jwtSecret"), {expiresIn: "1h"})

      res
          .status(200)
          .json({adminId:existingUser._id, token})
  })
  .catch(err => {
      res
          .status(400)
          .json({message: "Invalid access token!"})
  })

});




//Google register
router.post("/google-register-custom-btn", async (req, res) => {

  
    const {response} = req.body;


   const googleAccessToken=response.access_token
   
    axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
        "Authorization": `Bearer ${googleAccessToken}`
    }
})
    .then(async response2 => {
          
        const email = response2.data.email;
        const name = response2.data.given_name;
        

        const existingUser = await Admin.findOne({email})
     
        if (existingUser) 
            return res.status(400).json({message: "User already exist!"})

        const result = await Admin.create({email,name})

        const token = jwt.sign({
           
            _id: result._id
        }, config.get("jwtSecret"), {expiresIn: "1h"})

        res
            .status(200)
            .json({adminId:result._id, token})
    })
    .catch(err => {
        res
            .status(400)
            .json({message: "Invalid access token!"})
    })
  
});



//Google register
router.post("/google-register", async (req, res) => {

  if (req.body.response) {
    const {response} = req.body;
   
   verify(response.clientId,response.credential).then(async x=>{
    const email = x.email;
    const name=x.name;
    const existingUser = await Admin.findOne({email})
    
            if (existingUser) {

              return res.status(400).json({message: "User already exist!"})

            }
            const admin = await Admin.create({ email, name})
         
            const payload = {
              admin: {
                _id: admin._id,
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
                res.status(200).json({ token, adminId: admin._id });
              }
            );
        })
        .catch(err => {
            res
                .status(400)
                .json({message: "Invalid access token!"})
        })
 
} else {
  console.log("nothing happens")
}
  
});
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

//@route POST api/admins/reset-password
//@desc
//@access Public
// send email Link For reset Password
router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await Admin.findOne({ email: email });
    console.log("userfind" + userfind);
    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, config.get("jwtSecret"), {
      expiresIn: "3200s",
    });
    console.log("token " + token);
    const setusertoken = await Admin.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );
    console.log("setusertoken  " + setusertoken);
    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES http://localhost:3001/changepwd/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});



//Post user

router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;
  console.log("password: " + password);

  try {
    const validuser = await Admin.findOne({ _id: id });
    console.log("validuser+ " + validuser);
    const verifyToken = jwt.verify(token, config.get("jwtSecret"));

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await Admin.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

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

// GET route to get admin depending on id
router.get("/:adminId", auth, async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const name = admin.name;

    res.status(200).json(name); // Return the cycles in the response
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

//@route POST api/admins/reset-password
//@desc
//@access Public
// send email Link For reset Password
router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await Admin.findOne({ email: email });
    console.log("userfind" + userfind);
    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, config.get("jwtSecret"), {
      expiresIn: "120s",
    });

    const setusertoken = await Admin.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES http://localhost:3001/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});
