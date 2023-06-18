const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cycleSchema = new Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },

    cycles: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        users: [
          {
            firstName: String,
            lastName: String,
            goals: [
              {
                mainGoal: String,
                progress: {
                  type: Number,
                  default: 0,
                },
                subTasks: [
                  {
                    task: String,
                    done: Boolean,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Cycle = mongoose.model("Cycle", cycleSchema);

module.exports = Cycle;
