import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import indexRoute from './routes/indexRoute';
import { connection } from './database/dvconnection';
import { errorMiddleware } from "./middleware/error";
import userRouter from './routes/userRoutes';

// **************** Load environment variables ****************
dotenv.config();

// **************** Create Express app ****************
const app = express();

// **************** Middleware to parse JSON ****************
app.use(express.json());

// **************** Middleware for security ****************
app.use(helmet());

// **************** Middleware for CORS ****************
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// **************** Middleware to parse cookies ****************
app.use(cookieParser());

// **************** Middleware for compression ****************
app.use(compression());

// **************** Middleware for logging ****************
app.use(morgan('combined'));

// **************** User Routes ****************
app.use('/api/v1/user', userRouter);

// **************** Root Route ****************
app.use('/', indexRoute);

// **************** Error Handling Middleware ****************
// It's important to define error handling middleware after all routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error for debugging

  // Send a generic error message to the client
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// **************** Database Connection ****************
// It's generally better to connect to the database after setting up middleware and routes
connection();

// **************** Export the app for server setup ****************
export default app;
