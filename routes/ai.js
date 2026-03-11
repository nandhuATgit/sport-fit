const express = require("express");
const axios = require("axios");
const http = require("http");

const History = require("../models/History");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const agent = new http.Agent({
  keepAlive: true
});

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
You are **SportFit AI**, an elite AI sports scientist, fitness coach, and nutrition expert.

Your job is to generate **high-quality, practical fitness guidance** tailored to the user.

STRICT RESPONSE RULES (must follow):

- Use markdown formatting
- Start with a bold title
- Use section headings (###)
- Use bullet points (-)
- Keep sentences short
- Avoid long paragraphs
- Make the response easy to scan
- Always provide actionable advice

RESPONSE STRUCTURE (always follow this):

**Title related to the user's question**

Short helpful intro.

### 🎯 Goal Analysis
Explain how the advice helps the user's goal.

### 🏃 Training Recommendations
Provide specific exercises, drills, or sports training.

### 🥗 Nutrition Plan
Include foods and nutrition strategy.

### 🍗 Protein Intake
Calculate daily protein needs when possible.

### 💧 Hydration
Give daily hydration advice.

### ⚡ Performance Tips
Add tips to improve strength, endurance, recovery.

### 🛡 Injury Prevention
Provide safety recommendations.

### 🧠 Motivation Tip
Give one short motivational tip.

USER PROFILE

Age: ${user?.age || "unknown"}
Weight: ${user?.weight || "unknown"}
Goal: ${user?.goal || "general fitness"}

IMPORTANT RULES

- If the user asks about a sport, provide sport-specific drills and conditioning.
- If the user asks about diet, provide a structured diet plan.
- If the user asks about fitness, include both workout and nutrition advice.
- Adapt advice based on the user's goal.
- Always keep answers practical and realistic.

USER QUESTION:
${message}

Now generate the best possible response.
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3:mini",
        prompt,
        stream: true,
      },
      {
        responseType: "stream",
         httpAgent: agent
      }
    );

    res.setHeader("Content-Type", "text/plain");

    let fullReply = "";

    let buffer = "";

response.data.on("data", (chunk) => {
  buffer += chunk.toString();

  const parts = buffer.split("\n");
  buffer = parts.pop(); // keep incomplete part

  for (const part of parts) {
    if (!part.trim()) continue;

    try {
      const parsed = JSON.parse(part);
      const token = parsed.response || "";

      fullReply += token;
      res.write(token);
    } catch (err) {
      console.log("Skipping invalid chunk");
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

    const prompt = `
You are SportFit AI — an elite sports performance coach and nutritionist.

Your task is to generate a **complete training plan and nutrition guide** for the sport: ${sport}

User Profile
Age: ${user.age}
Weight: ${user.weight}
Goal: ${user.goal}

STRICT RULES

- Use markdown
- Use short sentences
- Use headings and bullet points
- Make the plan practical for athletes

RESPONSE FORMAT

**${sport} Training Program**

Short intro.

### Weekly Training Plan
Day 1
- drills
- conditioning

Day 2
- skill training
- strength training

Day 3
- recovery

### Sport-Specific Drills
- drills related to ${sport}

### Strength Training
- exercises for athletes

### Diet Plan

Breakfast
- foods

Lunch
- foods

Dinner
- foods

Snacks
- foods

### Protein Requirement
Calculate protein based on body weight.

### Hydration
Daily hydration advice.

### Injury Prevention
Safety tips for ${sport} athletes.

Now generate the best plan.
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3:mini",
        prompt,
        stream: false,

        
      },
      {
    httpAgent: agent
  }
    );

    const plan = response.data.response;

    user.trainingPlans.push({
      sport,
      plan
    });

    await user.save();

    res.json({
      sport,
      plan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "AI training plan error"
    });

  }

});

module.exports = router;