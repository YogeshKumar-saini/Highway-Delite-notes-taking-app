import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your IUser type if available
    }
  }
}
import ErrorHandler, { errorMiddleware } from "../middleware/error";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { User } from "../models/userModels";
import type { IUser } from "../models/userModels";
import { sendEmail } from "../utils/sendEmail";
import twilio from "twilio";
import dotenv from "dotenv";
import { sendToken } from "../utils/sendToken";
import { RequestValidationError } from "../utils/equestValidationError"; // Assuming you have a custom error class
import { InternalServerError } from "../utils/InternalServerError"; // Custom error for internal issues
dotenv.config();
import crypto from "crypto";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

// *************************** register ***************************
export const register = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, verificationMethod, dateOfBirth } = req.body;

    try {
      // Validate required fields
      if (!name || !email || !phone || !password || !verificationMethod || !dateOfBirth) {
        return next(errorMiddleware("All fields are required.", req, res, next, 400));
      }

      // Validate dateOfBirth format
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return next(errorMiddleware("Invalid date of birth format.", req, res, next, 400));
      }

      // Optional: Check if the user is at least 13 years old
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 13) {
        return next(errorMiddleware("You must be at least 13 years old to register.", req, res, next, 400));
      }

      // Check if the email or phone is already verified
      const existingUser = await User.findOne({
        $or: [
          { email, accountVerified: true },
          { phone, accountVerified: true },
        ],
      });

      if (existingUser) {
        return next(
          errorMiddleware("Phone or Email is already used.", req, res, next, 400)
        );
      }

      // Limit registration attempts for unverified users
      const registrationAttempts = await User.find({
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });

      if (registrationAttempts.length > 3) {
        return next(
          errorMiddleware(
            "Exceeded maximum registration attempts (3). Try again after an hour.",
            req,
            res,
            next,
            429
          )
        );
      }

      // Validate verification method
      const validMethods = ["email", "phone"];
      if (!validMethods.includes(verificationMethod)) {
        return next(
          errorMiddleware(
            "Invalid verification method. Supported: 'email' or 'phone'.",
            req,
            res,
            next,
            400
          )
        );
      }

      // Create user and generate verification code
      const user = await User.create({ name, email, phone, password, dateOfBirth });
      const verificationCode = await user.generateVerificationCode();
      await user.save();

      // Send verification code via chosen method
      const message = await sendVerificationCode(
        verificationMethod,
        verificationCode,
        user.name as string,
        user.email as string,
        user.phone as string
      );

      // Send final response
      res.status(201).json({
        success: true,
        message: `User registered successfully. ${message}`,
      });
    } catch (error) {
      next(error);
    }
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
  console.log("sendVerificationCode - verificationMethod:", verificationMethod);
  console.log("sendVerificationCode - email:", email);
  console.log("sendVerificationCode - phone:", phone);
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
    throw new Error("Invalid verification method");
  }
}


// *************************** generateEmailTemplate ***************************
function generateEmailTemplate(code: string | number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${code}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your account. It expires in 10 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply.</p>
      </footer>
    </div>
  `;
}

// ******************************** requestOTP ***************************
// ******************************** requestOTP ***************************
export const requestOTP = catchAsyncError(async (req, res, next) => {
  const { email, phone, loginMethod } = req.body;

  if (!loginMethod) {
    return next(errorMiddleware("Login method is required.", req, res, next, 400));
  }

  let user;
  try {
    if (loginMethod === "otp") {
      if (!email && !phone) {
        return next(errorMiddleware("Email or phone number is required for OTP login.", req, res, next, 400));
      }

      // Fetch user by email or phone
      user = await User.findOne({ $or: [{ email }, { phone }], accountVerified: true });
      if (!user) {
        return next(errorMiddleware("User not found or account not verified.", req, res, next, 404));
      }

      // Determine the verification method
      const verificationMethod = user.email ? "email" : (user.phone ? "phone" : "invalid");

      if (verificationMethod === "invalid") {
        return next(errorMiddleware("User has no email or phone number registered.", req, res, next, 400));
      }

      // Generate OTP
      const otp = user.generateVerificationCode();
      await user.save({ validateModifiedOnly: true });

      // Send OTP via chosen method
      const message = await sendVerificationCode(
        verificationMethod,
        otp,
        user.name as string,
        user.email as string,
        user.phone as string
      );

      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${verificationMethod}.`,
      });
    } else {
      return next(errorMiddleware("Invalid login method for OTP request.", req, res, next, 400));
    }
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return next(new InternalServerError("An error occurred while requesting OTP."));
  }
});


// ******************************** verifyOTP ***************************
export const verifyOTP = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, phone } = req.body;

  // Input Validation
  if ((!email && !phone) || !otp) {
    return next(
      new RequestValidationError("Email or Phone and OTP are required.", 400)
    );
  }

  // // Validate phone number format if provided
  // if (phone) {
  //   const phoneRegex = /^\+91\d{10}$/;
  //   if (!phoneRegex.test(phone)) {
  //     return next(
  //       new RequestValidationError("Invalid phone number format.", 400)
  //     );
  //   }
  // }

  try {
    // Fetch user entries with matching email or phone and not verified
    const userAllEntries = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    // Check if user exists
    if (!userAllEntries || userAllEntries.length === 0) {
      return next(
        new RequestValidationError("User not found or already verified.", 404)
      );
    }

    let user: IUser | undefined;
    // let user: User | undefined;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });
    } else {
      user = userAllEntries[0];
    }

    // Validate OTP
    if (!user.verificationCode) {
      return next(
        new RequestValidationError("OTP not found for this user.", 400)
      );
    }

    if (user.verificationCode !== Number(otp)) {
      return next(
        new RequestValidationError("Invalid OTP.", 400)
      );
    }

    // Check OTP expiry
    const currentTime = Date.now();
    if (!user.verificationCodeExpire) {
      return next(
        new RequestValidationError("OTP expiration information is missing.", 400)
      );
    }
    if (!user.verificationCodeExpire) {
      return next(errorMiddleware("OTP expiration information is missing.", req, res, next, 400));
    }
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(
        new RequestValidationError("OTP has expired.", 400)
      );
    }

    // Update user account status
    user.accountVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    // Send success response with token
    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return next(
      new InternalServerError("An error occurred while verifying the OTP. Please try again.")
    );
  }
});

// ******************************** login **************************
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, otp, loginMethod } = req.body;

  if (!email || !loginMethod) {
    return next(errorMiddleware("Email and login method are required.", req, res, next, 400));
  }

  let user;
  try {
    if (loginMethod === "password") {
      // Password-based login
      if (!password) {
        return next(errorMiddleware("Password is required for password-based login.", req, res, next, 400));
      }
      user = await User.findOne({ email, accountVerified: true }).select("+password");
      if (!user) {
        return next(errorMiddleware("Invalid email or password.", req, res, next, 400));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(errorMiddleware("Invalid email or password.", req, res, next, 400));
      }
    } else if (loginMethod === "otp") {
      // OTP-based login
      if (!otp) {
        return next(errorMiddleware("OTP is required for OTP-based login.", req, res, next, 400));
      }
      user = await User.findOne({ email, accountVerified: true });
      if (!user) {
        return next(errorMiddleware("Invalid email or OTP.", req, res, next, 400));
      }
      if (!user.verificationCode) {
        return next(errorMiddleware("OTP not found for this user.", req, res, next, 400));
      }
      if (user.verificationCode !== Number(otp)) {
        return next(errorMiddleware("Invalid OTP.", req, res, next, 400));
      }
      const currentTime = Date.now();
      if (!user.verificationCodeExpire) {
        return next(errorMiddleware("OTP expiration information is missing.", req, res, next, 400));
      }
      const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
      if (currentTime > verificationCodeExpire) {
        return next(errorMiddleware("OTP has expired.", req, res, next, 400));
      }
      user.verificationCode = undefined;
      user.verificationCodeExpire = undefined;
      await user.save({ validateModifiedOnly: true });
    } else {
      return next(errorMiddleware("Invalid login method. Use 'password' or 'otp'.", req, res, next, 400));
    }

    // Update the login method if tracking is enabled
    if (user.loginMethod !== loginMethod) {
      user.loginMethod = loginMethod;
      await user.save({ validateModifiedOnly: true });
    }

    // Generate and send token
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

// Forgot Password
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
    return next(
      new ErrorHandler(
        errorMessage,
        500
      )
    );
  }
});


// Reset Password
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
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});