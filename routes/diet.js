const express = require("express");
const Diet = require("../models/Diet");

const router = express.Router();

router.get("/:goal", async (req, res) => {
  const diet = await Diet.findOne({ goal: req.params.goal });
  res.json(diet);
});

module.exports = router;
