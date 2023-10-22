const mongoose = require("mongoose");

const GoalSchema = mongoose.Schema({
  cycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cycle",
  },
  subtasks: [
    {
      subtaskName: String,
      isCompleted: Boolean,
    },
  ],
});

const Goal = mongoose.model("Goal", GoalSchema);

module.exports = Goal;
