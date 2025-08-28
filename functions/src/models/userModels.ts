import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  accountVerified: boolean;
  verificationCode?: number;
  verificationCodeExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword: (enteredPassword: string) => Promise<boolean>;
  generateVerificationCode: () => number;
  generateToken: () => string;
  generateResetPasswordToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    phone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          return value < new Date();
        },
        message: "Date of birth must be in the past.",
      },
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Methods
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function (): number {
  const generateRandomFiveDigitNumber = (): number => {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return parseInt(firstDigit + remainingDigits, 10);
  };

  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  return verificationCode;
};

userSchema.methods.generateToken = function (): string {
  const secret: Secret | undefined = process.env.JWT_SECRET;
  const expiresIn = ((process.env.JWT_EXPIRES_IN as string | undefined) || "1h") as SignOptions['expiresIn'];

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const signOptions: SignOptions = { expiresIn };

  // Payload can include any user data you need
  const payload = {
    id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, secret, signOptions);
};


userSchema.methods.generateResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return resetToken;
};

export const User = mongoose.model<IUser>("User", userSchema);
