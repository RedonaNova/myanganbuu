// Creates a new migration from schema changes without a shadow database
// (the DB user can't CREATE DATABASE):
//   npm run db:diff -- add_something
// Review the generated SQL, then apply with `npm run db:deploy`.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const name = (process.argv[2] ?? "").replace(/[^a-z0-9_]/gi, "_");
if (!name) {
  console.error("Usage: npm run db:diff -- <migration_name>");
  process.exit(1);
}

const sql = execFileSync(
  "npx",
  ["prisma", "migrate", "diff", "--from-migrations", "prisma/migrations", "--to-schema", "prisma/schema.prisma", "--script"],
  { encoding: "utf8", shell: process.platform === "win32" },
);
if (!sql.replace(/--.*$/gm, "").trim()) {
  console.log("No schema changes.");
  process.exit(0);
}
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = path.join("prisma", "migrations", `${stamp}_${name}`);
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, "migration.sql"), sql);
console.log(`Wrote ${dir}/migration.sql — review it, then run: npm run db:deploy`);
