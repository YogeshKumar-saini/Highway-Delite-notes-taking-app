import ErrorHandler from "../middleware/errorMiddleware";
import  {catchAsyncError}  from "../middleware/catchAsyncError";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, dateOfBirth, password } = req.body;

});