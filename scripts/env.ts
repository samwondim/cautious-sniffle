/**
 * Loads `.env.local` then `.env` (local values win) so every script and
 * the Next.js runtime agree on one configuration source.
 */
import { existsSync } from "node:fs";

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  loaded = true;
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

loadEnv();
