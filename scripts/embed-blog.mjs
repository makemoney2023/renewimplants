import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "../content/blog");
const files = readdirSync(dir)
  .filter((name) => name.endsWith(".mdx"))
  .sort();
const posts = Object.fromEntries(files.map((name) => [name, readFileSync(join(dir, name), "utf8")]));
writeFileSync(join(import.meta.dirname, "../src/lib/blog-sources.json"), `${JSON.stringify(posts, null, 2)}\n`);
