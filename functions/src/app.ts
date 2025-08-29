import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import indexRoute from './routes/indexRoute';
import { connection } from './database/dvconnection';
import userRouter from './routes/userRoutes';
import { removeUnverifiedAccounts } from './automation/removeunverifyaccount';
import noteRoutes from "./routes/noteRoutes";
import {errorMiddleware} from "./middleware/error";
//  Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Middleware for security
app.use(helmet());

// Middleware for CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware to parse cookies
app.use(cookieParser());

// Middleware for compression
app.use(compression());

// Middleware for logging
app.use(morgan('combined'));

// User Routes
app.use('/api/v1/user', userRouter);
// Note Routes
app.use('/api/v1', noteRoutes);

// Root Route
app.use('/', indexRoute);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); 
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});
app.use(errorMiddleware);
removeUnverifiedAccounts();
// Database Connection
connection();

// Export the app for server setup
export default app;
