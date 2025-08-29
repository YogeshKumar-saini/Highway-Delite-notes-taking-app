import express from "express";
 import { forgotPassword, getUser, login, logout, register, verifyOTP } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
export default router;