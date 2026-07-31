import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function hasWorkingPrismaClient() {
  try {
    const prismaClient = require("@prisma/client");
    return (
      typeof prismaClient?.PrismaClient === "function" &&
      prismaClient?.DocumentVisibility?.PUBLIC === "PUBLIC"
    );
  } catch {
    return false;
  }
}

export function ensurePrismaClient({ allowExistingClientFallback = false } = {}) {
  try {
    console.log("[prisma] generate…");
    execSync("npx --no-install prisma generate", {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    return;
  } catch (error) {
    if (allowExistingClientFallback && hasWorkingPrismaClient()) {
      console.warn("[prisma] generate a echoue, mais le client existant est valide. On continue.");
      return;
    }

    throw error;
  }
}
