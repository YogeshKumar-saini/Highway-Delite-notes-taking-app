import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());


app.listen(port, async () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
