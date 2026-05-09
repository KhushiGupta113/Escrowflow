import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, Otp, AuditLog, RefreshToken } from "../models";
import { sendEmail } from "../services/notification.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret";

export const sendOtp = async (req: Request, res: Response) => {
  const { email, type } = req.body;
  if (type === "signup") {
    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, "Account already exists");
  } else {
    const exists = await User.findOne({ email });
    if (!exists) throw new ApiError(404, "User not found");
  }

  const otpStr = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email, type });
  await Otp.create({ email, otp: otpStr, type, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  
  await sendEmail(email, "Your EscrowFlow OTP", `Your OTP is: ${otpStr}. Valid for 10 minutes.`);
  res.json(new ApiResponse(200, null, "OTP sent"));
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role, otp } = req.body;

  const validOtp = await Otp.findOne({ email, otp, type: "signup" });
  if (!validOtp) throw new ApiError(400, "Invalid or expired OTP");

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  
  await Otp.deleteMany({ email, type: "signup" });
  await AuditLog.create({ actorId: user._id, entity: "user", entityId: String(user._id), action: "signup" });
  
  res.json(new ApiResponse(201, { id: user._id }));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const accessToken = jwt.sign({ sub: String(user._id), role: user.role }, accessSecret, { expiresIn: "24h" });
  const refreshTokenString = crypto.randomBytes(40).toString("hex");
  
  await RefreshToken.create({
    token: refreshTokenString,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  res.cookie("refreshToken", refreshTokenString, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json(new ApiResponse(200, { accessToken, user: { id: user._id, role: user.role, name: user.name, email: user.email } }));
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const validOtp = await Otp.findOne({ email, otp, type: "forgot_password" });
  if (!validOtp) throw new ApiError(400, "Invalid or expired OTP");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  await Otp.deleteMany({ email, type: "forgot_password" });
  
  res.json(new ApiResponse(200, null, "Password reset successful"));
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) {
    console.log("Cookies received:", req.cookies);
    throw new ApiError(401, "Missing refresh token");
  }

  const storedToken = await RefreshToken.findOne({ token, revoked: false, expiresAt: { $gt: new Date() } });
  if (!storedToken) {
    res.clearCookie("refreshToken", { path: "/" });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(storedToken.userId);
  if (!user) throw new ApiError(401, "Invalid user");

  // Rotate token
  storedToken.revoked = true;
  await storedToken.save();

  const accessToken = jwt.sign({ sub: String(user._id), role: user.role }, accessSecret, { expiresIn: "24h" });
  const newRefreshTokenString = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    token: newRefreshTokenString,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.cookie("refreshToken", newRefreshTokenString, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json(new ApiResponse(200, { accessToken }));
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.updateOne({ token }, { revoked: true });
  }
  res.clearCookie("refreshToken", { path: "/" });
  res.json(new ApiResponse(200, null, "Logged out successfully"));
};
