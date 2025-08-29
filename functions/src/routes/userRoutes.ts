import express from "express";
 import { login, logout, register, verifyOTP } from "../controllers/userController";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", logout);
export default router;