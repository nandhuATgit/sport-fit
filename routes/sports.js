const express = require("express");
const Sport = require("../models/Sport");

const router = express.Router();

router.get("/:name", async (req, res) => {
  const sport = await Sport.findOne({ name: req.params.name });
  res.json(sport);
});

module.exports = router;