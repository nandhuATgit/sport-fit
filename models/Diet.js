const mongoose = require("mongoose");

const dietSchema = new mongoose.Schema({
  goal: String,
  meals: [String],
  calories: Number,
  routine: String
});

module.exports = mongoose.model("Diet", dietSchema);