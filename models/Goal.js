const mongoose = require("mongoose");

const GoalSchema = mongoose.Schema({
  cycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cycle",
  },
  subtasks: [
    {
      subtaskName: String,
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Goal = mongoose.model("Goal", GoalSchema);

module.exports = Goal;
