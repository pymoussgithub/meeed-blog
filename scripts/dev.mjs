import { join } from "node:path";
import { execSync } from "node:child_process";
import { ensurePrismaClient } from "./ensure-prisma-client.mjs";

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";
process.env.NEXT_TELEMETRY_DISABLED ??= "1";

ensurePrismaClient({ allowExistingClientFallback: true });

const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
execSync(`node "${nextBin}" dev`, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
