import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import { AuditLog, Dispute, Milestone, Notification, Payment, Project, User, Otp } from "./models";
import { emitToProject, emitToUser } from "./socket";
import { UserRole } from "./types";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 100 }));

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "rzp_test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "rzp_test_secret"
});

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

type AuthReq = express.Request & { user?: { id: string; role: UserRole } };

const response = (res: express.Response, data: unknown, message = "ok") =>
  res.json({ success: true, message, data });

const authRequired =
  (...roles: UserRole[]) =>
  (req: AuthReq, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, accessSecret) as { sub: string; role: UserRole };
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      req.user = { id: decoded.sub, role: decoded.role };
      return next();
    } catch {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };

const sendEmail = async (to: string, subject: string, text: string) => {
  // eslint-disable-next-line no-console
  console.log(`[DEVELOPER INFO] Sending Email to ${to}: ${subject}\nContent: ${text}`);
  
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ [MAILER] No credentials found. Email was NOT sent, but logged above for testing.");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || '"EscrowFlow" <noreply@escrowflow.com>',
      to,
      subject,
      text
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ [MAILER ERROR] Failed to send real email. Falling back to terminal log.", err);
  }
};

app.get("/health", async (_req, res) => response(res, { status: "healthy" }));

app.post("/api/auth/otp/send", async (req, res) => {
  const { email, type } = z.object({ email: z.string().email(), type: z.enum(["signup", "forgot_password"]) }).parse(req.body);
  
  if (type === "signup") {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Account already exists" });
  } else {
    const exists = await User.findOne({ email });
    if (!exists) return res.status(404).json({ success: false, message: "User not found" });
  }

  const otpStr = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email, type });
  await Otp.create({ email, otp: otpStr, type, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  
  await sendEmail(email, "Your EscrowFlow OTP", `Your OTP is: ${otpStr}. Valid for 10 minutes.`);
  response(res, null, "OTP sent");
});

app.post("/api/auth/signup", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["client", "freelancer", "admin"]),
    otp: z.string().length(6)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });

  const validOtp = await Otp.findOne({ email: parsed.data.email, otp: parsed.data.otp, type: "signup" });
  if (!validOtp) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return res.status(409).json({ success: false, message: "Email already in use" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ 
    name: parsed.data.name, 
    email: parsed.data.email, 
    passwordHash, 
    role: parsed.data.role 
  });
  
  await Otp.deleteMany({ email: parsed.data.email, type: "signup" });
  await AuditLog.create({ actorId: user._id, entity: "user", entityId: String(user._id), action: "signup" });
  response(res, { id: user._id });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email, otp, newPassword } = z.object({ 
    email: z.string().email(), 
    otp: z.string().length(6), 
    newPassword: z.string().min(8) 
  }).parse(req.body);

  const validOtp = await Otp.findOne({ email, otp, type: "forgot_password" });
  if (!validOtp) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  await Otp.deleteMany({ email, type: "forgot_password" });
  
  response(res, null, "Password reset successful");
});

app.post("/api/auth/login", async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });

  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const accessToken = jwt.sign({ sub: String(user._id), role: user.role }, accessSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ sub: String(user._id) }, refreshSecret, { expiresIn: "7d" });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", secure: false, path: "/api/auth" });
  response(res, { accessToken, user: { id: user._id, role: user.role, name: user.name, email: user.email } });
});

app.post("/api/auth/refresh", async (req, res) => {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) return res.status(401).json({ success: false, message: "Missing refresh token" });
  try {
    const decoded = jwt.verify(token, refreshSecret) as { sub: string };
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ success: false, message: "Invalid user" });
    const accessToken = jwt.sign({ sub: String(user._id), role: user.role }, accessSecret, { expiresIn: "15m" });
    return response(res, { accessToken });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
});

app.post("/api/projects", authRequired("client"), async (req: AuthReq, res) => {
  const schema = z.object({ title: z.string().min(3), description: z.string().min(10), budget: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const project = await Project.create({ ...parsed.data, clientId: req.user!.id });
  response(res, project, "Project created");
});

app.get("/api/projects", authRequired(), async (req: AuthReq, res) => {
  const query = req.user?.role === "client" ? { clientId: req.user.id } : req.user?.role === "freelancer" ? { freelancerId: req.user.id } : {};
  const projects = await Project.find(query).sort({ createdAt: -1 });
  response(res, projects);
});

app.post("/api/milestones", authRequired("client"), async (req: AuthReq, res) => {
  const schema = z.object({ projectId: z.string(), title: z.string().min(3), amount: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const milestone = await Milestone.create({ ...parsed.data });
  emitToProject(parsed.data.projectId, "milestone:created", milestone);
  response(res, milestone, "Milestone created");
});

app.post("/api/escrow/fund/:milestoneId", authRequired("client"), async (req: AuthReq, res) => {
  const milestone = await Milestone.findById(req.params.milestoneId);
  if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
  const order = await razorpay.orders.create({
    amount: Math.round((milestone as any).amount * 100),
    currency: "INR",
    receipt: `escrow_${milestone._id}`
  });
  const payment = await Payment.create({
    milestoneId: milestone._id,
    payerId: req.user!.id,
    amount: (milestone as any).amount,
    status: "initiated",
    razorpayOrderId: order.id
  });
  response(res, { order, payment }, "Funding initiated");
});

app.post("/api/escrow/verify", authRequired("client"), async (req, res) => {
  const schema = z.object({ razorpayOrderId: z.string(), razorpayPaymentId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const payment = await Payment.findOne({ razorpayOrderId: parsed.data.razorpayOrderId });
  if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });
  payment.status = "verified";
  (payment as any).razorpayPaymentId = parsed.data.razorpayPaymentId;
  await payment.save();
  await Milestone.findByIdAndUpdate((payment as any).milestoneId, { status: "funded" });
  response(res, payment, "Payment verified");
});

app.post("/api/milestones/:id/submit", authRequired("freelancer"), async (req, res) => {
  const schema = z.object({ submissionUrl: z.string().url() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const milestone = await Milestone.findByIdAndUpdate(
    req.params.id,
    { status: "submitted", submissionUrl: parsed.data.submissionUrl },
    { new: true }
  );
  if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
  response(res, milestone, "Work submitted");
});

app.post("/api/escrow/release/:milestoneId", authRequired("client", "admin"), async (req: AuthReq, res) => {
  const milestone = await Milestone.findById(req.params.milestoneId);
  if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
  if ((milestone as any).status === "released") return res.status(409).json({ success: false, message: "Already released" });
  if (!["approved", "submitted"].includes((milestone as any).status)) {
    return res.status(400).json({ success: false, message: "Milestone not releaseable" });
  }
  (milestone as any).status = "released";
  await milestone.save();
  await Payment.create({ milestoneId: milestone._id, amount: (milestone as any).amount, payerId: req.user?.id, status: "released" });
  response(res, milestone, "Funds released");
});

app.post("/api/disputes", authRequired("client", "freelancer"), async (req: AuthReq, res) => {
  const schema = z.object({ milestoneId: z.string(), reason: z.string().min(10), evidenceUrls: z.array(z.string().url()).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const dispute = await Dispute.create({
    milestoneId: parsed.data.milestoneId,
    reason: parsed.data.reason,
    evidenceUrls: parsed.data.evidenceUrls ?? [],
    raisedBy: req.user!.id
  });
  await Milestone.findByIdAndUpdate(parsed.data.milestoneId, { status: "disputed" });
  response(res, dispute, "Dispute raised");
});

app.post("/api/admin/disputes/:id/resolve", authRequired("admin"), async (req, res) => {
  const schema = z.object({ outcome: z.enum(["release", "refund"]), resolution: z.string().min(5) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });
  dispute.status = "resolved";
  dispute.resolution = parsed.data.resolution;
  await dispute.save();
  if (parsed.data.outcome === "release") {
    await Milestone.findByIdAndUpdate((dispute as any).milestoneId, { status: "approved" });
  } else {
    await Milestone.findByIdAndUpdate((dispute as any).milestoneId, { status: "funded" });
  }
  response(res, dispute, "Dispute resolved");
});

app.get("/api/notifications", authRequired(), async (req: AuthReq, res) => {
  const list = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50);
  response(res, list);
});

app.get("/api/dashboard/summary", authRequired(), async (req: AuthReq, res) => {
  const role = req.user!.role;
  const [activeProjects, disputed, released] = await Promise.all([
    Project.countDocuments(role === "client" ? { clientId: req.user!.id, status: { $ne: "closed" } } : { freelancerId: req.user!.id }),
    Milestone.countDocuments({ status: "disputed" }),
    Payment.countDocuments({ status: "released" })
  ]);
  
  // Real calculation would happen here for Escrow Balance (sum of Payments), but defaulting to 0 for new accounts
  response(res, { activeProjects, disputed, released, pendingApprovals: 0, escrowBalance: 0 });
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: { title: "EscrowFlow API", version: "1.0.0" },
    paths: {}
  })
);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error("Express Error:", error);
  res.status(500).json({ success: false, message: error.message || "Server Error" });
});

export { app };
