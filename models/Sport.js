const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema({
  name: String,
  equipment: [String],
  routine: String,
  diet: String
});

module.exports = mongoose.model("Sport", sportSchema);