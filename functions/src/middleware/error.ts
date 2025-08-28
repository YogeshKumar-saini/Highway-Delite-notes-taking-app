import { Request, Response, NextFunction } from "express";

export class ErrorHandler extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ErrorHandler.prototype);
  }
}

interface ErrorWithStatus extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  name: string;
  path?: string;
}

/**
 * Can be used in two ways:
 * 1) As Express middleware: errorMiddleware(err, req, res, next)
 * 2) As a function to throw an error: errorMiddleware(message, req, res, next, statusCode)
 */
export const errorMiddleware = (
  arg1: any,
  req?: Request,
  res?: Response,
  next?: NextFunction,
  statusCode?: number
) => {
  // If called as function to throw an error
  if (typeof arg1 === "string" && req && res && next) {
    const err = new ErrorHandler(arg1, statusCode || 400);
    return next(err);
  }

  // Express middleware usage
  const err: ErrorWithStatus = arg1;
  let code = err.statusCode || 500;
  let message = err.message || "Internal Server Error.";

  // Mongoose CastError
  if (err.name === "CastError") {
    message = `Invalid ${err.path}`;
    code = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Json Web Token is invalid, try again.";
    code = 400;
  }

  if (err.name === "TokenExpiredError") {
    message = "Json Web Token has expired, try again.";
    code = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000 && err.keyValue) {
    const fields = Object.keys(err.keyValue).join(", ");
    message = `Duplicate value entered for: ${fields}`;
    code = 400;
  }

  return res?.status(code).json({
    success: false,
    message,
  });
};

export default ErrorHandler;
