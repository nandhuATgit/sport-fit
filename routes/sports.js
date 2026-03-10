const express = require("express");
const Sport = require("../models/Sport");
const sportsData = require("../data/sportsData");

const router = express.Router();

router.get("/db/:name", async (req, res) => {
  const sport = await Sport.findOne({ name: req.params.name });
  res.json(sport);
});

router.get("/data/:sport", (req, res) => {
  const sport = sportsData.find(
    s => s.name.toLowerCase() === req.params.sport.toLowerCase()
  );

  if (!sport) return res.status(404).json({ message: "Sport not found" });

  res.json(sport);
});


router.get("/", (req, res) => {
  res.json(sportsData);
});

module.exports = router;