import { Request, Response, NextFunction } from "express";
import { errorMiddleware } from "../middleware/error";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { User } from "../models/userModels";
import {sendEmail} from "../utils/sendEmail";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID as string, process.env.TWILIO_AUTH_TOKEN as string);

export const register = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password, verificationMethod } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new Error("All fields are required."));
    }

    // Validate phone number
    // Validate phone number
    // // const phoneRegex = /^\+\d{1,3}[-.\s]?\d{4,14}$/; // Updated regex
    // if (!phoneRegex.test(phone)) {
    //   return next(new errorMiddleware("Invalid phone number.", 400));
    // }
    // Check if the email or phone is already in use by an account that has been verified
    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    if (existingUser) {
      return next(errorMiddleware("Phone or Email is already used.", req, res, next));
    }

    // Check for previous registration attempts that are not verified
    const registrationAttempts = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registrationAttempts.length > 3) {
      return next(
        errorMiddleware(
          "You have exceeded the maximum number of registration attempts (3). Please try again after an hour.",
          req,
          res,
          next
        )
      );
    }

    // Validate verification method
    const validVerificationMethods = ["email", "phone"];
    if (!validVerificationMethods.includes(verificationMethod)) {
      return next(errorMiddleware("Invalid verification method. Supported methods are 'email' and 'phone'.", req, res, next));
    }

    // Create user data
    const userData = {
      name,
      email,
      phone,
      password,
      // Include dateOfBirth if necessary
      // dateOfBirth: new Date(dateOfBirth),
    };

    // Create user and generate verification code
    const user = await User.create(userData);
    const verificationCode = await user.generateVerificationCode();
    await user.save();

    // Send verification code via the chosen method
    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      user.name,
      user.email,
      user.phone!,
      res
    );

    res.status(201).json({
      success: true,
      message: `User registered successfully. Verification code sent via ${verificationMethod}.`,
      // In a real application, avoid sending the verification code in the response
      // verificationCode,
    });
  } catch (error) {
    next(error);
  }
});


async function sendVerificationCode(
  verificationMethod: string,
  verificationCode: string | number,
  name: string,
  email: string,
  phone: string,
  res: Response
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail({ email, subject: "Your Verification Code", message });
      res.status(200).json({
        success: true,
        message: `Verification email successfully sent to ${name}.`,
      });
    } else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .join(" ");
      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
        from: process.env.TWILIO_PHONE_NUMBER as string,
        to: phone,
      });
      res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}.`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid verification method.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
    });
  }
}

function generateEmailTemplate(verificationCode: string | number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear Sir,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>
  `;
}


