// middleware/error.ts
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

export const errorMiddleware = (
  err: ErrorHandler | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let statusCode = (err as any).statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log errors for backend debugging
  console.error(" Error:", err);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
