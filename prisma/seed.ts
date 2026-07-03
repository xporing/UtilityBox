import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!Strong";
  const name = process.env.SEED_ADMIN_NAME ?? "UtilityBox Admin";

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: await hash(password, 12),
      role: "admin",
      status: "active"
    },
    create: {
      email,
      name,
      passwordHash: await hash(password, 12),
      role: "admin",
      status: "active"
    }
  });

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
