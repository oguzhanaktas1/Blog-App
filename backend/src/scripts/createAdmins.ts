import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";

const admins = [
  {
    name: "Main Admin",
    username: "mainadmin",
    email: "aktasoguzhan80@gmail.com",
    password: "admin123",
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
            username: admin.username,
            email: admin.email,
            password: hashedPassword,
            role: "admin",
          },
        });
        console.log(`Admin '${admin.email}' created.`);
      } else {
        console.log(`Admin '${admin.email}' already exists. Skipping.`);
      }
    }
  } catch (error: any) {
    console.error("Admin Creation Error", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
