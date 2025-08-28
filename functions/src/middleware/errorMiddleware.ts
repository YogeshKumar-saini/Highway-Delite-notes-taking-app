import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../utils/errorHandler';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine the status code and message
  let statusCode = err instanceof ErrorHandler ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'CastError') {
    statusCode = 400;
    const castErr = err as Error & { path?: string; value?: any };
    message = `Invalid ${castErr.path ?? 'field'}: ${castErr.value ?? ''}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid JWT token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'JWT token has expired. Please log in again.';
  } else if ((err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error. Please provide a unique value.';
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


// ***************  export
export default errorMiddleware;