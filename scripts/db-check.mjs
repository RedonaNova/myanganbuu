// Diagnoses why the app cannot connect to MySQL, using the same DATABASE_URL.
// Prints the real driver errors that Next.js hides as "[Object]".
//   node scripts/db-check.mjs        (run in the app folder on the server)
import "dotenv/config";
import mariadb from "mariadb";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set (.env)");
  process.exit(1);
}
const base = new URL(raw);
base.protocol = "mariadb:";
console.log(`target  ${base.hostname}:${base.port || 3306}  db=${base.pathname.slice(1)}  user=${decodeURIComponent(base.username)}`);
console.log(`params  ${base.search || "(none)"}\n`);

const describe = (e) => `${e.code ?? "?"} errno=${e.errno ?? "?"} ${String(e.message).split("\n")[0]}`;

async function connectOnce(url) {
  const t0 = Date.now();
  try {
    const conn = await mariadb.createConnection(url.toString());
    await conn.query("SELECT 1");
    await conn.end();
    return { ok: true, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, error: describe(e) };
  }
}

// 1. Fresh single connections, one after another.
console.log("1. ten fresh connections");
let failed = 0;
for (let i = 1; i <= 10; i++) {
  const r = await connectOnce(base);
  if (!r.ok) failed++;
  console.log(`   ${String(i).padStart(2)}  ${r.ok ? "ok  " : "FAIL"} ${String(r.ms).padStart(5)} ms  ${r.error ?? ""}`);
}

// 2. Other spellings of "localhost" (IPv6 vs IPv4 mix-ups show up here).
if (["localhost", "127.0.0.1", "::1"].includes(base.hostname)) {
  console.log("\n2. same server by other names");
  for (const host of ["127.0.0.1", "[::1]", "localhost"]) {
    const u = new URL(base);
    u.hostname = host;
    const r = await connectOnce(u);
    console.log(`   ${host.padEnd(10)} ${r.ok ? "ok" : "FAIL " + r.error}`);
  }
}

// 3. The way the app uses it: a pool with several queries at once.
console.log("\n3. pool of 5, 30 queries at once");
const pool = mariadb.createPool(base.toString() + (base.search ? "&" : "?") + "connectionLimit=5&acquireTimeout=10000");
const results = await Promise.allSettled(Array.from({ length: 30 }, () => pool.query("SELECT 1")));
const bad = results.filter((r) => r.status === "rejected");
console.log(`   ${results.length - bad.length} ok, ${bad.length} failed`);
for (const m of new Set(bad.map((r) => describe(r.reason.cause ?? r.reason)))) console.log(`   ${m}`);

// 4. What the server says about connection trouble (needs one working connection).
console.log("\n4. server counters");
try {
  const conn = await pool.getConnection();
  const status = await conn.query(
    "SHOW GLOBAL STATUS WHERE Variable_name IN ('Aborted_connects','Connection_errors_internal','Connection_errors_max_connections','Connection_errors_peer_address','Threads_connected','Max_used_connections')",
  );
  const vars = await conn.query("SHOW VARIABLES WHERE Variable_name IN ('max_connect_errors','connect_timeout','wait_timeout','skip_name_resolve','bind_address')");
  for (const r of [...status, ...vars]) console.log(`   ${String(r.Variable_name).padEnd(36)} ${r.Value}`);
  conn.release();
} catch (e) {
  console.log(`   (no connection available: ${describe(e)})`);
}
await pool.end().catch(() => {});

console.log(failed || bad.length ? "\nResult: connection problems found, see the errors above." : "\nResult: all connections worked from this process.");
process.exit(failed || bad.length ? 1 : 0);
