import { hash } from "@node-rs/argon2";

/**
 * Argon2id parameters for admin passwords. One place, so the seed script and
 * the admin "Add user" action produce hashes that `verify()` in `auth.ts`
 * treats identically. Keep this module free of Next imports: the seed script
 * runs outside Next and imports it directly.
 */
export function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}
