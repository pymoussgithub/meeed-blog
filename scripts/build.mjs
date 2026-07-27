import { execSync } from "node:child_process";
import { join } from "node:path";

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";
process.env.NEXT_TELEMETRY_DISABLED ??= "1";

const env = {
  ...process.env,
  // Evite trop de processus enfants pendant le build (EAGAIN sur Infomaniak).
  UV_THREADPOOL_SIZE: "2",
};

console.log("[build] prisma generate…");
execSync("npx --no-install prisma generate", { stdio: "inherit", shell: true, env });

const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
console.log("[build] next build…");
execSync(`node "${nextBin}" build`, { stdio: "inherit", shell: true, env });

console.log("[build] OK");
