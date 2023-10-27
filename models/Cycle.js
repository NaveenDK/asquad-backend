const mongoose = require("mongoose");

const CycleSchema = mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  cycleMembers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      goals: [
        {
          goalName: String,
          subtasks: [
            {
              subTaskName: String,
              isCompleted: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
      ],
    },
  ],
});

const Cycle = mongoose.model("Cycle", CycleSchema);

module.exports = Cycle;
