const prisma = require("./src/services/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("Testing database...");

  const passwordHash = await bcrypt.hash("123456", 12);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "direct@fitai.com",
      passwordHash,
    },
  });

  console.log("\nCREATED USER:");
  console.log(user);

  const users = await prisma.user.findMany();

  console.log("\nALL USERS:");
  console.log(users);
}

main()
  .catch((error) => {
    console.error("\nDATABASE ERROR:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });