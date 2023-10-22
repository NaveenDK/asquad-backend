const mongoose = require("mongoose");

const CycleSchema = mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
});

const Cycle = mongoose.model("Cycle", CycleSchema);

module.exports = Cycle;
