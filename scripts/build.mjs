import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";

// Windows + standalone: un build interrompu laisse des symlinks qui bloquent le suivant.
try {
  rmSync(join(".next", "standalone"), { recursive: true, force: true });
} catch {
  // Ignore cleanup errors and let Next.js handle them.
}

execSync("npx --no-install prisma generate", { stdio: "inherit", shell: true });
execSync("npx next build", { stdio: "inherit", shell: true, env: process.env });
