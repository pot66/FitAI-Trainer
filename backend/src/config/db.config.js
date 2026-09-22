require("./env");

function parseDatabaseConfig() {
  const missing = [];
  const warnings = [];

  let host = process.env.DB_HOST;
  let port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
  let user = process.env.DB_USER;
  let password = process.env.DB_PASSWORD;
  let database = process.env.DB_NAME;

  let allowPublicKeyRetrieval = true;
  if (process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL !== undefined) {
    allowPublicKeyRetrieval = process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL !== "false";
  }

  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      if (!host) host = parsed.hostname;
      if (!port && parsed.port) port = Number(parsed.port);
      if (!user && parsed.username) user = decodeURIComponent(parsed.username);
      if ((!password || password === "") && parsed.password) {
        password = decodeURIComponent(parsed.password);
      }
      if (!database && parsed.pathname) {
        database = parsed.pathname.replace(/^\//, "");
      }
      if (parsed.searchParams.has("allowPublicKeyRetrieval")) {
        allowPublicKeyRetrieval = parsed.searchParams.get("allowPublicKeyRetrieval") === "true";
      }
    } catch (err) {
      warnings.push(`Invalid DATABASE_URL format: ${err.message}. Falling back to DB_* variables.`);
    }
  } else if (!host && !database) {
    if (process.env.NODE_ENV === "production") {
      missing.push("DATABASE_URL or DB_HOST/DB_NAME environment variables are required in production.");
    } else {
      warnings.push("No DATABASE_URL or DB_* environment variables detected. Using local defaults (127.0.0.1:3307/fitai_trainer).");
    }
  }

  const config = {
    host: host || "127.0.0.1",
    port: port || 3307,
    user: user || "fitai",
    password: password !== undefined ? password : "",
    database: database || "fitai_trainer",
    connectionLimit: Number(process.env.DB_POOL_SIZE || 20),
    connectTimeout: 10000,
    acquireTimeout: 10000,
    idleTimeout: 30000,
    minDelayValidation: 500,
    allowPublicKeyRetrieval,
    missing,
    warnings,
  };

  return config;
}

const dbConfig = parseDatabaseConfig();

module.exports = dbConfig;
