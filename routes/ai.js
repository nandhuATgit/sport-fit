const express = require("express");
const axios = require("axios");
const History = require("../models/History");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/ask", auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const prompt = `
You are SportFit AI — an expert fitness and nutrition coach.

STRICT RESPONSE RULES (must follow):

- Always use markdown formatting
- Start with a clear bold title
- Use section headings (###)
- Use bullet points (-)
- Keep sentences short
- Add blank lines between sections
- NEVER write long paragraphs
- Make the answer easy to scan

RESPONSE FORMAT EXAMPLE:

**Morning Diet Plan**

Short intro line.

### 🥚 Protein
- Eggs
- Greek yogurt

### 🍞 Carbs
- Oats
- Whole wheat toast

### 🥑 Healthy Fats
- Almonds
- Avocado

User Profile:
Age: ${user?.age || "unknown"}
Weight: ${user?.weight || "unknown"}
Goal: ${user?.goal || "general fitness"}

User Question:
${message}

Now respond following the rules strictly.
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt,
        stream: true,
      },
      {
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "text/plain");

    let fullReply = "";

    response.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const token = parsed.response || "";

          fullReply += token;
          res.write(token);
        } catch (e) {
          console.error("Chunk parse error:", e.message);
        }
      }
    });

    response.data.on("end", async () => {
      try {
        await History.create({
          userId: user._id,
          message,
          reply: fullReply,
        });
      } catch (err) {
        console.error("History save error:", err.message);
      }

      res.end();
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({ message: "AI server error" });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user }).sort({
      createdAt: -1,
    });

    res.json(history);
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ message: "History error" });
  }
});






router.post("/training-plan", auth, async (req, res) => {

  try {

    const { sport } = req.body;

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* SIMPLE AI RESPONSE FOR NOW */

    const plan = `
Training Plan for ${sport}

Age: ${user.age}
Weight: ${user.weight}

Weekly Plan

Day 1
Speed drills
Basic skill training

Day 2
Strength training
Core exercises

Diet
Balanced carbohydrates
Lean protein

Protein Intake
${user.weight ? user.weight * 1.5 : "N/A"}g per day

Injury Prevention
Stretch before workouts
Stay hydrated
`;

    /* SAVE PLAN */

    user.trainingPlans.push({
      sport: sport,
      plan: plan
    });

    await user.save();

    res.json({
      sport: sport,
      plan: plan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;