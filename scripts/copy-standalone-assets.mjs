import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = join(root, ".next", "standalone");
const serverEntry = join(standaloneDir, "server.js");

if (!existsSync(serverEntry)) {
  console.log("No standalone build found, skipping asset copy.");
  process.exit(0);
}

cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });

const standaloneStaticDir = join(standaloneDir, ".next", "static");
mkdirSync(standaloneStaticDir, { recursive: true });
cpSync(join(root, ".next", "static"), standaloneStaticDir, { recursive: true });

console.log("Standalone assets copied.");
