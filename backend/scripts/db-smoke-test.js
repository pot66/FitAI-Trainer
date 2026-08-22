/**
 * Quick manual check that the app can reach the database using the same
 * connection path as the real server (services/prisma.js -> DATABASE_URL).
 * Run with: node scripts/db-smoke-test.js
 *
 * Safe to run repeatedly - it cleans up its own test user each time
 * instead of failing on a duplicate email.
 */

const prisma = require("../src/services/prisma");
const bcrypt = require("bcryptjs");

const TEST_EMAIL = "db-smoke-test@fitai.local";

async function main() {
  console.log("Testing database connection...");

  // Clean up any leftover test user from a previous run first.
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  const passwordHash = await bcrypt.hash("smoke-test-password", 12);

  const user = await prisma.user.create({
    data: {
      name: "DB Smoke Test",
      email: TEST_EMAIL,
      passwordHash,
    },
  });

  console.log("Created test user:", { id: user.id, email: user.email });

  const totalUsers = await prisma.user.count();
  console.log("Total users in database:", totalUsers);

  // Clean up after ourselves so this script leaves no trace.
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Cleaned up test user. Database connection is healthy.");
}

main()
  .catch((error) => {
    console.error("\nDATABASE ERROR:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
