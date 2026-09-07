const { appConfig, validateConfig } = require("./config");
const app = require("./app");

// Check and validate configuration on startup
validateConfig();

const { port, host } = appConfig;

const server = app.listen(port, host, () => {
  console.log(`FitAI Trainer API running at http://${host}:${port} [${appConfig.env}]`);
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