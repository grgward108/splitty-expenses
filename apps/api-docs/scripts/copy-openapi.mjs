import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");
const src = join(repoRoot, "packages/spec/generated/openapi.yaml");
const destDir = join(__dirname, "../public");
const dest = join(destDir, "openapi.yaml");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied OpenAPI spec to ${dest}`);
