const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = require("./app");

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`FitAI Trainer API running at http://${HOST}:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down server...");

  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down server...");

  server.close(() => {
    process.exit(0);
  });
});