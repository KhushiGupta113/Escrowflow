import dotenv from "dotenv";
dotenv.config();

import http from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { initSocket } from "./socket";

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/escrowflow";

async function bootstrap() {
  await mongoose.connect(mongoUri);
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`EscrowFlow API listening on ${port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to boot server", error);
  process.exit(1);
});
