import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@myhair.al";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null,
    },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Super admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
