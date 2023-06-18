const router = require("express").Router();
const Cycle = require("../models/cycle.model");
const Admin = require("../models/admin.model.js");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

//@route GET api/cycles
//@desc Get all admins cycles
//@access Private
// GET route for retrieving cycles for a specific admin
// router.get("/:adminId", async (req, res) => {
//   try {
//     const { adminId } = req.params;

//     const cycles = await Cycle.find({ admin: adminId });

//     res.status(200).json(cycles);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//@route POST api/cycles
//@desc Add new cycles
//@access Private
// Assuming you have already imported the required modules and defined the models
// POST route for adding a cycle for a specific admin
// router.post("/:adminId", async (req, res) => {
//   try {
//     const { adminId } = req.params;

//     const { startDate, endDate, users } = req.body;

//     const cycle = new Cycle({
//       admin: adminId,
//       startDate,
//       endDate,
//       users,
//     });

//     const savedCycle = await cycle.save();

//     res.status(201).json(savedCycle);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.route("/add").post((req, res) => {
//   console.log("add reached");
//   const startDate = Date.parse(req.body.startDate);
//   const endDate = Date.parse(req.body.endDate);

//   const users = req.body.users;

//   const newCycle = new Cycle({
//     startDate,
//     endDate,
//     users,
//   });
//   newCycle
//     .save()
//     .then(() => res.json("Cycle Added"))
//     .catch((err) => res.status(400).json("Error " + err));
// });
router.route("/:id").get((req, res) => {
  Cycle.findById(req.params.id)
    .then((cycle) => res.json(cycle))
    .catch((err) => res.status(400).json("Error:" + err));
});

router.route("/:id").delete((req, res) => {
  Cycle.findByIdAndDelete(req.params.id)
    .then(() => res.json("Cycle deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").post((req, res) => {
  Cycle.findById(req.params.id).then((cycle) => {
    cycle.startDate = req.body.startDate;
    cycle.endDate = req.body.endDate;
    cycle.users = req.body.users;

    cycle
      .save()
      .then(() => res.json("Cycle updated"))
      .catch((err) => res.status(400).json("Error" + err));
  });
});
// router.route('/updatetask/:cycleId/user/:userId/task/:taskId/subtask/:sbId').post((req,res)=>{

//     console.log("req.params.userId")
//      console.log(req.params.userId)
//      console.log("req.params.taskId")
//      console.log(req.params.taskId)

//      Cycle.findById(req.params.cycleId)
//      .then(cycle=>{

//       //console.log("cycle : "+JSON.stringify(cycle))

//       console.log("typeof cycle.users : "+ typeof cycle.users)
//       let user = cycle.users.find(item => item._id == req.params.userId);
//       let goal= user.goals.find(goal=>goal._id==req.params.taskId)
//       //let sb= user.goals.subtasks.find(goal=>goal._id==req.params.taskId)
//       let subtask= goal.subTasks.find(sb=>sb._id==req.params.sbId)
//     //   console.log("user found: " + user)
//     //   console.log("goal found: " + goal)
//     //   console.log("Subtaskfound: " + subtask)
//     //   console.log("subtask.done" +subtask.done )
//     //   subtask.done=req.body.us
//     console.log("check whats in req.body" + JSON.stringify(req.body.users.userId))
//       cycle.save()
//       .then (()=>res.json('cycle updated'))
//       .catch(err=>res.status(400).json('Error'+err))
//      // console.log("Subtask found: " + subtask)
//     ///  console.log(req.params.userId)
//      })

// })
// router.route('/update/:cycleId/user/:userId/task/:taskId/subtask/:subtaskId').get((req,res)=>{
//     Cycle.findById(req.params.cycleId)
//      .then(cycle=>{

//        console.log("print cycle: "+ cycle)
//      })
// })

module.exports = router;
