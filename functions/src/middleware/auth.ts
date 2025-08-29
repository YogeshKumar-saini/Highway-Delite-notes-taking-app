import jwt from "jsonwebtoken";
import { User } from "../models/userModels";
import { catchAsyncError } from "./catchAsyncError";
import ErrorHandler from "./error";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 400));
  }
  if (!process.env.JWT_SECRET_KEY) {
    return next(new ErrorHandler("JWT secret key is not defined.", 500));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string };

  req.user = await User.findById(decoded.id);

  next();
});