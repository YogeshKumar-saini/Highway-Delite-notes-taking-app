import express from "express";
 import { login, logout, register, verifyOTP } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
export default router;