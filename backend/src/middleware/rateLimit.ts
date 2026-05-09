import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  message: { success: false, message: "Too many requests, please try again later." }
});
