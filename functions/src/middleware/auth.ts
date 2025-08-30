import jwt from "jsonwebtoken";
import { User } from "../models/userModels";
import { catchAsyncError } from "./catchAsyncError";
import { RequestValidationError } from "../utils/equestValidationError"; // Assuming you have a custom error class
import ErrorHandler from "../utils/errorHandler";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new RequestValidationError("User is not authenticated.", 401));
  }
  if (!process.env.JWT_SECRET_KEY) {
    return next(new ErrorHandler("Internal server error: JWT secret key is not defined.", 500));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string };

  req.user = await User.findById(decoded.id);

  next();
});