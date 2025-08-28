import express, { Application } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import db from "./models";

const { sequelize } = db;

const app: Application = express();
const port: number = Number(process.env.PORT) || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Example route using Sequelize model
app.get("/users", async (req, res) => {
  try {
    const users = await db.User.findAll(); // ✅ works now
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Start server
app.listen(port, async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected successfully!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
