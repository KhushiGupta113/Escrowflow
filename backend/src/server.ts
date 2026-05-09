import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { app } from "./app";
import { initSocket } from "./config/socket";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT ?? 5000);

async function bootstrap() {
  await connectDB();
  
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`EscrowFlow API listening on ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to boot server", error);
  process.exit(1);
});
