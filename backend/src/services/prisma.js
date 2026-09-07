const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const dbConfig = require("../config/db.config");

const adapter = new PrismaMariaDb(dbConfig);

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;