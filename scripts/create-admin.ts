// Creates the single admin account, or resets its password.
//   npm run admin:create -- <username> <password>
// or set ADMIN_USERNAME / ADMIN_PASSWORD in the environment.
import { hash } from "@node-rs/argon2";
import { createPrisma } from "./lib/prisma";

const username = process.argv[2] ?? process.env.ADMIN_USERNAME;
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error("Usage: npm run admin:create -- <username> <password>");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const prisma = createPrisma();
const passwordHash = await hash(password);
const user = await prisma.adminUser.upsert({
  where: { username },
  create: { username, passwordHash },
  update: { passwordHash },
});
// A password change signs out every existing session.
await prisma.session.deleteMany({ where: { userId: user.id } });
await prisma.$disconnect();
console.log(`Admin "${username}" is ready.`);
