const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
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
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
