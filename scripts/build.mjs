import { execSync } from "node:child_process";

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";

console.log("[build] prisma generate…");
execSync("npx --no-install prisma generate", { stdio: "inherit", shell: true });

console.log("[build] next build…");
execSync("npx --no-install next build", { stdio: "inherit", shell: true, env: process.env });

console.log("[build] OK");
