// Jalankan skema dan benih akaun pentadbir pertama.
// Guna: npm run migrate
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { pool, query } from "./db.js";
import { env } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!env.DATABASE_URL) {
    console.error("DATABASE_URL tidak ditetapkan. Sila isi fail .env.");
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  console.log("Menjalankan skema pangkalan data...");
  await query(schema);
  console.log("Skema selesai.");

  // Benih pentadbir jika belum wujud
  const semak = await query("SELECT id FROM pengguna WHERE emel = $1", [env.ADMIN_EMAIL]);
  if (semak.rowCount === 0) {
    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await query(
      "INSERT INTO pengguna (nama, emel, kata_laluan, peranan) VALUES ($1, $2, $3, 'pentadbir')",
      [env.ADMIN_NAMA, env.ADMIN_EMAIL, hash]
    );
    console.log(`Akaun pentadbir dicipta: ${env.ADMIN_EMAIL}`);
  } else {
    console.log("Akaun pentadbir sudah wujud, langkau.");
  }

  await pool.end();
  console.log("Migrasi selesai.");
}

main().catch((err) => {
  console.error("Migrasi gagal:", err);
  process.exit(1);
});
