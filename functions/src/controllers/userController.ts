import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your IUser type if available
    }
  }
}
import ErrorHandler from "../utils/errorHandler";
import { errorMiddleware } from "../middleware/error";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { User } from "../models/userModels";
import type { IUser } from "../models/userModels";
import { sendEmail } from "../utils/sendEmail";
import twilio from "twilio";
import dotenv from "dotenv";
import { sendToken } from "../utils/sendToken";
import { RequestValidationError } from "../utils/equestValidationError"; 
import { InternalServerError } from "../utils/InternalServerError"; 
import crypto from "crypto";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

// *************************** register ***************************
export const register = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, verificationMethod, dateOfBirth } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !verificationMethod || !dateOfBirth) {
      return next(new ErrorHandler("All fields are required.", 400));
    }

    // Validate dateOfBirth format
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return next(new ErrorHandler("Invalid date of birth format.", 400));
    }

    // Check age >= 13
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) {
      return next(new ErrorHandler("You must be at least 13 years old to register.", 400));
    }

    // Check if the email or phone is already verified
    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or Email is already used.", 400));
    }

    // Limit registration attempts for unverified users
    const registrationAttempts = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registrationAttempts.length > 3) {
      return next(new ErrorHandler("Exceeded maximum registration attempts (3). Try again after an hour.", 429));
    }

    // Validate verification method
    const validMethods = ["email", "phone"];
    if (!validMethods.includes(verificationMethod)) {
      return next(new ErrorHandler("Invalid verification method. Supported: 'email' or 'phone'.", 400));
    }

    // Create user and generate verification code
    const user = await User.create({ name, email, phone, password, dateOfBirth });
    const verificationCode = await user.generateVerificationCode();
    await user.save();

    // Send verification code
    const message = await sendVerificationCode(
      verificationMethod,
      verificationCode,
      user.name as string,
      user.email as string,
      user.phone as string
    );

    res.status(201).json({
      success: true,
      message: `User registered successfully. ${message}`,
    });
  }
);

// *************************** sendVerificationCode ***************************
async function sendVerificationCode(
  verificationMethod: string,
  verificationCode: string | number,
  name: string,
  email: string,
  phone: string
) {
  if (verificationMethod === "email") {
    const message = generateEmailTemplate(verificationCode);
    await sendEmail({ email, subject: "Your Verification Code", message });
    return "OTP sent via email.";
  } else if (verificationMethod === "phone") {
    const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
    await client.messages.create({
      body: `Your verification code is ${verificationCodeWithSpace}`,
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: phone,
    });
    return "OTP sent via SMS.";
  } else {
    throw new ErrorHandler("Invalid verification method", 400);
  }
}

// *************************** generateEmailTemplate ***************************
function generateEmailTemplate(code: string | number) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Verification Code</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Please use this code to verify your account. It expires in 10 minutes.</p>
    </div>
  `;
}

// ******************************** requestOTP ***************************
export const requestOTP = catchAsyncError(async (req, res, next) => {
  const { email, phone, loginMethod } = req.body;

  if (!loginMethod) {
    return next(new ErrorHandler("Login method is required.", 400));
  }

  try {
    if (loginMethod === "otp") {
      if (!email && !phone) {
        return next(new ErrorHandler("Email or phone number is required for OTP login.", 400));
      }

      const user = await User.findOne({ $or: [{ email }, { phone }], accountVerified: true });
      if (!user) {
        return next(new ErrorHandler("User not found or account not verified.", 404));
      }

      const verificationMethod = user.email ? "email" : (user.phone ? "phone" : "invalid");
      if (verificationMethod === "invalid") {
        return next(new ErrorHandler("User has no email or phone registered.", 400));
      }

      const otp = user.generateVerificationCode();
      await user.save({ validateModifiedOnly: true });

      await sendVerificationCode(verificationMethod, otp, user.name as string, user.email as string, user.phone as string);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${verificationMethod}.`,
      });
    } else {
      return next(new ErrorHandler("Invalid login method for OTP request.", 400));
    }
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return next(new InternalServerError("An error occurred while requesting OTP."));
  }
});

// ******************************** verifyOTP ***************************
export const verifyOTP = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, phone } = req.body;

  if ((!email && !phone) || !otp) {
    return next(new RequestValidationError("Email or Phone and OTP are required.", 400));
  }

  try {
    const userAllEntries = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    if (!userAllEntries || userAllEntries.length === 0) {
      return next(new RequestValidationError("User not found or already verified.", 404));
    }

    let user: IUser = userAllEntries[0];
    if (userAllEntries.length > 1) {
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });
    }

    if (!user.verificationCode) {
      return next(new RequestValidationError("OTP not found for this user.", 400));
    }
    if (user.verificationCode !== Number(otp)) {
      return next(new RequestValidationError("Invalid OTP.", 400));
    }

    const currentTime = Date.now();
    if (!user.verificationCodeExpire) {
      return next(new RequestValidationError("OTP expiration information is missing.", 400));
    }
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
    if (currentTime > verificationCodeExpire) {
      return next(new RequestValidationError("OTP has expired.", 400));
    }

    user.accountVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return next(new InternalServerError("An error occurred while verifying the OTP. Please try again."));
  }
});

// ******************************** login **************************
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, otp, loginMethod } = req.body;

  if (!email || !loginMethod) {
    return next(new ErrorHandler("Email and login method are required.", 400));
  }

  try {
    let user;
    if (loginMethod === "password") {
      if (!password) {
        return next(new ErrorHandler("Password is required for password-based login.", 400));
      }
      user = await User.findOne({ email, accountVerified: true }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 400));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 400));
      }
    } else if (loginMethod === "otp") {
      if (!otp) {
        return next(new ErrorHandler("OTP is required for OTP-based login.", 400));
      }
      user = await User.findOne({ email, accountVerified: true });
      if (!user) {
        return next(new ErrorHandler("Invalid email or OTP.", 400));
      }
      if (!user.verificationCode) {
        return next(new ErrorHandler("OTP not found for this user.", 400));
      }
      if (user.verificationCode !== Number(otp)) {
        return next(new ErrorHandler("Invalid OTP.", 400));
      }
      const currentTime = Date.now();
      if (!user.verificationCodeExpire) {
        return next(new ErrorHandler("OTP expiration information is missing.", 400));
      }
      const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
      if (currentTime > verificationCodeExpire) {
        return next(new ErrorHandler("OTP has expired.", 400));
      }
      user.verificationCode = undefined;
      user.verificationCodeExpire = undefined;
      await user.save({ validateModifiedOnly: true });
    } else {
      return next(new ErrorHandler("Invalid login method. Use 'password' or 'otp'.", 400));
    }

    if (user.loginMethod !== loginMethod) {
      user.loginMethod = loginMethod;
      await user.save({ validateModifiedOnly: true });
    }

    sendToken(user, 200, "User logged in successfully.", res);
  } catch (error) {
    console.error("Error during login:", error);
    return next(new InternalServerError("An error occurred during login. Please try again."));
  }
});

// ******************************** logout **************************
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

// ******************************** getUser ***************************
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// ******************************** forgotPassword ***************************
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "MERN AUTHENTICATION APP RESET PASSWORD for notes app",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    let errorMessage = "Cannot send reset password token.";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    }
    return next(new ErrorHandler(errorMessage, 500));
  }
});

// ******************************** resetPassword ***************************
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Reset password token is invalid or has expired.", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & confirm password do not match.", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});
