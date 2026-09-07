const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

function getDbConfig() {
  let host = process.env.DB_HOST;
  let port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
  let user = process.env.DB_USER;
  let password = process.env.DB_PASSWORD;
  let database = process.env.DB_NAME;

  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      if (!host) host = parsed.hostname;
      if (!port && parsed.port) port = Number(parsed.port);
      if (!user && parsed.username) user = decodeURIComponent(parsed.username);
      if (password === undefined && parsed.password) password = decodeURIComponent(parsed.password);
      if (!database && parsed.pathname) database = parsed.pathname.replace(/^\//, "");
    } catch {
      // ignore invalid URL
    }
  }

  return {
    host: host || "localhost",
    port: port || 3306,
    user: user || "root",
    password: password !== undefined ? password : "",
    database: database || "fitai_trainer",
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  };
}

const adapter = new PrismaMariaDb(getDbConfig());

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;