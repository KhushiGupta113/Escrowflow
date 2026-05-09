import nodemailer from "nodemailer";
import { Notification } from "../models";
import { emitToUser } from "../config/socket";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(`[DEVELOPER INFO] Sending Email to ${to}: ${subject}\nContent: ${text}`);
  
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
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
    console.error("❌ [MAILER ERROR] Failed to send real email. Falling back to terminal log.", err);
  }
};

export const createNotification = async (userId: string, type: string, title: string, message: string, link?: string) => {
  const notification = await Notification.create({ userId, type, title, message, link, read: false });
  emitToUser(userId, "notification:new", notification);
  return notification;
};
