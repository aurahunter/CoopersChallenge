/**
 * Gera foto.webp a partir de foto.png (menor peso no hero).
 * Uso: npm run optimize:assets
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "src", "assets");
const input = join(assetsDir, "foto.png");
const output = join(assetsDir, "foto.webp");

if (!existsSync(input)) {
  console.error("Arquivo não encontrado:", input);
  process.exit(1);
}

const info = await sharp(input)
  .resize(720, 720, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(output);

const before = (await import("node:fs")).statSync(input).size;
console.log(`foto.png: ${(before / 1024).toFixed(0)} KB`);
console.log(`foto.webp: ${(info.size / 1024).toFixed(0)} KB → ${output}`);
