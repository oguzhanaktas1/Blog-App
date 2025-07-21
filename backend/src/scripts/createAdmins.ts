import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";

const admins = [
  {
    name: "Main Admin",
    email: "aktasoguzhan80@gmail.com",
    password: "admin123",
  },
  {
    name: "Second Admin",
    email: "oguzhan.emre4@gmail.com",
    password: "admin456",
  },
];

async function main() {
  try {
    for (const admin of admins) {
      const exists = await prisma.user.findUnique({ where: { email: admin.email } });

      if (!exists) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await prisma.user.create({
          data: {
            name: admin.name,
            email: admin.email,
            password: hashedPassword,
            role: "admin", // Kullanıcı modeli role içeriyor olmalı
          },
        });
        console.log(`✅ Admin '${admin.email}' created.`);
      } else {
        console.log(`ℹ️ Admin '${admin.email}' already exists. Skipping.`);
      }
    }
  } catch (error: any) {
    // Error handler style: print error and exit with non-zero code
    console.error("[Admin Creation Error]", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
