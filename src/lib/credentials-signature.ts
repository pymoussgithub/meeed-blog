import { createHash } from "node:crypto";

/** Empreinte du hash MDP — change à chaque reset / changement → invalide les JWT. */
export function credentialsSignature(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 32);
}
