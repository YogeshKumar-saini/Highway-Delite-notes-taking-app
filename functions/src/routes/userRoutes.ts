import express from "express";
 import { forgotPassword, getUser, login, logout, register, requestOTP, resetPassword, verifyOTP } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
// Request OTP for OTP-based login
router.post("/login/otp", requestOTP);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;