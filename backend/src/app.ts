import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CORS_ORIGIN ?? "").split(",")
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin === o || origin.includes("vercel.app"))) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "ok", data: { status: "healthy" } });
});

app.use("/api", routes);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: { title: "EscrowFlow API", version: "1.0.0" },
    paths: {}
  })
);

app.use(errorHandler);

export { app };
