import { config } from "dotenv";

config();

import { pingCloudinary, configureCloudinary } from "../src/lib/cloudinary";

async function main() {
  try {
    configureCloudinary();
    const result = await pingCloudinary();
    console.log("Cloudinary OK:", result);
    process.exit(0);
  } catch (error) {
    console.error("Cloudinary KO:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
