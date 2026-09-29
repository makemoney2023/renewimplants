import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";

// Mirrors src/lib/media-sync.ts (kept in plain JS so the pre* hooks run
// without a TypeScript loader). The Vitest spec guards the TS copy.
const jobs = [
  { from: "assets/heroes", to: "public/media/heroes" },
  { from: "assets/interiors", to: "public/media/interiors" },
  { from: "assets/staff", to: "public/media/staff" },
  { from: "assets/other", to: "public/media/services" },
  { from: "assets/video/optimized", to: "public/media/video", extension: ".mp4" },
  {
    from: "assets/implant-animation",
    to: "public/media/animation",
    files: [
      "dental-implant-angled-16x9.png",
      "dental-implant-angled-9x16.png",
      "implant-assemble-web-16x9.mp4",
      "implant-assemble-web-16x9.webm",
      "implant-assemble-web-9x16.mp4",
      "implant-assemble-web-9x16.webm",
    ],
  },
  {
    from: "assets/treatment-animation",
    to: "public/media/treatments",
    files: ["allon4", "fullarch", "snapon", "sedation"].flatMap((name) =>
      ["16x9", "9x16"].flatMap((aspect) =>
        ["mp4", "webm"].map((ext) => `treatment-${name}-web-${aspect}.${ext}`),
      ),
    ),
  },
];

function copyJob(job) {
  if (extname(job.to)) {
    mkdirSync(dirname(job.to), { recursive: true });
    if (existsSync(job.from)) cpSync(job.from, job.to);
    return;
  }

  rmSync(job.to, { recursive: true, force: true });
  mkdirSync(job.to, { recursive: true });
  if (!existsSync(job.from)) {
    console.warn(`media-sync: missing source ${job.from}`);
    return;
  }

  const names = job.files ?? readdirSync(job.from);
  for (const name of names) {
    if (name.startsWith(".")) continue;
    if (job.extension && extname(name) !== job.extension) continue;
    const source = join(job.from, name);
    if (!existsSync(source)) continue;
    cpSync(source, join(job.to, name));
  }
}

for (const job of jobs) {
  copyJob(job);
}
