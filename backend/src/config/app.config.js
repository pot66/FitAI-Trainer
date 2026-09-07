require("./env");

function parseAllowedOrigins() {
  const defaults = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
  const origins = [];

  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.push(trimmed);
    });
  }

  if (process.env.FRONTEND_URL) {
    const fe = process.env.FRONTEND_URL.trim();
    if (fe && !origins.includes(fe)) origins.push(fe);
  }

  defaults.forEach((def) => {
    if (!origins.includes(def)) origins.push(def);
  });

  return origins;
}

const warnings = [];
const missing = [];

const parsedPort = Number(process.env.PORT || 5000);
if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
  warnings.push(`PORT "${process.env.PORT}" is invalid. Defaulting to port 5000.`);
}

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    missing.push("JWT_SECRET is required in production environment.");
  } else {
    warnings.push("JWT_SECRET is unset. Using default development secret key.");
  }
}

if (!process.env.CORS_ORIGINS && !process.env.FRONTEND_URL) {
  warnings.push("CORS_ORIGINS / FRONTEND_URL unset. Defaulting to local frontend origins.");
}

const appConfig = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535 ? 5000 : parsedPort,
  host: process.env.HOST || "0.0.0.0",

  jwt: {
    secret: process.env.JWT_SECRET || "fitai_trainer_development_secret_change_later",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  cors: {
    allowedOrigins: parseAllowedOrigins(),
  },

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jsonLimit: process.env.JSON_BODY_LIMIT || "8mb",
  warnings,
  missing,
};

module.exports = appConfig;
