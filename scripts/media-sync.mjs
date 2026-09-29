import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { getMediaSyncJobs } from "../src/lib/media-sync.ts";

const jobs = getMediaSyncJobs();

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
    if (!existsSync(source)) {
      throw new Error(`media-sync: required source is missing: ${source}`);
    }
    cpSync(source, join(job.to, name));
  }
}

for (const job of jobs) {
  copyJob(job);
}
