import express from "express";
 import { register, verifyOTP } from "../controllers/userController";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);

export default router;