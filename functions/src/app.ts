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

//********** Load environment variables ****************
dotenv.config();

// **************** Create Express app ****************
const app = express();

//**********  Middleware to parse JSON ****************
app.use(express.json());

//**********  Middleware for security ****************
app.use(helmet());

//**********  Middleware for CORS ****************

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
//**********  Middleware to parse cookies ****************
app.use(cookieParser());

//**********  Middleware for compression ****************
app.use(compression());

//**********  Middleware for logging ****************
app.use(morgan('combined'));

// **************** User Routes ****************
app.use('/api/v1/user', userRouter);

// **************** dataBase Connecting ************    
connection();

// Error handling middleware
app.use(errorMiddleware);

// Export the app for server setup
export default app;
