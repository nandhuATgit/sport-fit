const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,

  name: {
    type: String,
    default: ""
  },

  age: {
    type: Number,
    default: null
  },

   weight: {
    type: Number,
    default: null
  },

  goal: {
    type: String,
    default: ""
  },

  sports: {
    type: [String],
    default: []
  },

  diet: {
    type: String,
    default: ""
  },

  history: {
    type: [String],
    default: []
  },

  trainingPlans: [
    {
      sport: String,
      plan: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});
module.exports = mongoose.model("User", userSchema);