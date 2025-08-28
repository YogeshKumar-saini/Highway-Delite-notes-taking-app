import { Response } from "express";

export const sendToken = (
  user: any,
  statusCode: number,
  message: string,
  res: Response
) => {
  const token = user.generateToken();
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + (Number(process.env.COOKIE_EXPIRE ?? 7) * 24 * 60 * 60 * 1000)
      ),
      httpOnly: true,
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};