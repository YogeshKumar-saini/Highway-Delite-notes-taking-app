import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import indexRoute from './routes/indexRoute';
import { connection } from './database/dvconnection';

// **************** Load environment variables ****************
dotenv.config();

// **************** Create Express app ****************
const app = express();

//**********  Middleware to parse JSON ****************
app.use(express.json());

//**********  Middleware for security ****************
app.use(helmet());

//**********  Middleware for CORS ****************
app.use(cors());

//**********  Middleware to parse cookies ****************
app.use(cookieParser());

//**********  Middleware for compression ****************
app.use(compression());

//**********  Middleware for logging ****************
app.use(morgan('combined'));

// **************** dataBase Connecting ************    
connection();

// Error handling middleware *********************
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Use the routes ************************
app.use('/', indexRoute);

// Error handling middleware *********************
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app for server setup
export default app;
