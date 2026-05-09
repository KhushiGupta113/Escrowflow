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

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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
