const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema({
  groupname: {
    type: String,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  categories: [
    [
      {
        id: {
          type: String,
          required: false,
        },
        label: {
          type: String,
          required: false,
        },
      },
    ],
  ],
  description: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
