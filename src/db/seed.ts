import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { languages } from "./schema";
import { SUPPORTED_LANGUAGES } from "../lib/db/languages";

loadEnvConfig(process.cwd());

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding supported languages into Neon PostgreSQL...");
  const sql = neon(dbUrl);
  const db = drizzle(sql);

  for (const lang of SUPPORTED_LANGUAGES) {
    await db
      .insert(languages)
      .values({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: lang.flag,
      })
      .onConflictDoNothing({ target: languages.code });
  }

  console.log("✅ Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
