import { Request, Response, NextFunction } from "express";
import { errorMiddleware } from "../middleware/error";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { User } from "../models/userModels";
import { sendEmail } from "../utils/sendEmail";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);
export const register = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, verificationMethod } = req.body;

    try {
      // Validate required fields
      if (!name || !email || !phone || !password || !verificationMethod) {
        return next(errorMiddleware("All fields are required.", req, res, next, 400));
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
      const user = await User.create({ name, email, phone, password });
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
  } else if (verificationMethod === "phone") {
    const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
    await client.calls.create({
      twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}</Say></Response>`,
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: phone,
    });
  } else {
    throw new Error("Invalid verification method");
  }
}


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
