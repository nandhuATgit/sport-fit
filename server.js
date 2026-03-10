require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const userRoutes = require("./routes/user");
const sportsRoutes = require("./routes/sports");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ ROUTES (ORDER MATTERS)
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sports", sportsRoutes);

app.use("/api/diet", require("./routes/diet"));

// ✅ SERVE FRONTEND
app.use(express.static("public"));

// ✅ MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SportFit running on http://localhost:${PORT}`);
});
