import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { postIsReady, type SocialPreviewPost } from "./social-preview-model";

export const APPROVAL_DECISIONS = ["approved", "not-approved"] as const;
export type ApprovalDecision = (typeof APPROVAL_DECISIONS)[number];
export type ApprovalStatus = ApprovalDecision | "pending";

/** Click and media host for the scheduler. Matches pipeline.json primaryCta.host. */
export const APPROVAL_MEDIA_ORIGIN = "https://renewimplants.vercel.app";

export type ApprovalRecord = {
  id: string;
  decision: ApprovalDecision;
  decidedAt: string;
};

export type ApprovalQueueItem = {
  id: string;
  decision: "approved";
  decidedAt: string;
  lane: SocialPreviewPost["lane"];
  format: SocialPreviewPost["format"];
  caption: string;
  onScreen: string;
  ctaLabel: string;
  instagramHref: string;
  facebookHref: string;
  video: string | null;
  poster: string | null;
  images: string[] | null;
  publishable: true;
  scheduledAt: null;
  postedAt: null;
};

export const approvalRequestSchema = z.object({
  id: z.string().trim().min(1).max(80),
  decision: z.enum(["approved", "not-approved", "pending"]),
});

const recordSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(APPROVAL_DECISIONS),
  decidedAt: z.string().min(20),
});

const fileSchema = z.array(recordSchema);

export class UnknownCatalogUnitError extends Error {
  constructor(id: string) {
    super(`Unknown catalog unit: ${id}`);
    this.name = "UnknownCatalogUnitError";
  }
}

export function approvalStatus(records: readonly ApprovalRecord[], id: string): ApprovalStatus {
  return records.find((record) => record.id === id)?.decision ?? "pending";
}

export function decisionsToMap(records: readonly ApprovalRecord[]) {
  return new Map(records.map((record) => [record.id, record.decision]));
}

function absoluteMedia(path: string | null) {
  if (!path) return null;
  return new URL(path, APPROVAL_MEDIA_ORIGIN).toString();
}

/**
 * Approved units that already have media. Not-approved and pending units stay out.
 * scheduledAt and postedAt stay null until a scheduler writes them.
 */
export function buildApprovalQueue(posts: readonly SocialPreviewPost[], records: readonly ApprovalRecord[]): ApprovalQueueItem[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return posts.flatMap((post) => {
    const record = byId.get(post.id);
    if (!record || record.decision !== "approved" || !postIsReady(post)) return [];
    return [
      {
        id: post.id,
        decision: "approved" as const,
        decidedAt: record.decidedAt,
        lane: post.lane,
        format: post.format,
        caption: post.caption,
        onScreen: post.onScreen,
        ctaLabel: post.ctaLabel,
        instagramHref: post.instagramHref,
        facebookHref: post.facebookHref,
        video: absoluteMedia(post.video),
        poster: absoluteMedia(post.poster),
        images: post.images?.map((image) => absoluteMedia(image) as string) ?? null,
        publishable: true as const,
        scheduledAt: null,
        postedAt: null,
      },
    ];
  });
}

type ApprovalStore = {
  list: () => Promise<ApprovalRecord[]>;
  save: (record: ApprovalRecord) => Promise<void>;
  clear: (id: string) => Promise<void>;
};

export function approvalsFilePath() {
  return process.env.SOCIAL_APPROVALS_PATH ?? join(process.cwd(), "data", "social-approvals.json");
}

export function createFileApprovalStore(filePath: string): ApprovalStore {
  let chain = Promise.resolve();
  const run = <T>(task: () => Promise<T>) => {
    const next = chain.then(task, task);
    chain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  };

  async function read(): Promise<ApprovalRecord[]> {
    try {
      const raw = await readFile(filePath, "utf8");
      return fileSchema.parse(JSON.parse(raw));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async function write(records: ApprovalRecord[]) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`);
  }

  return {
    list: () => run(read),
    save: (record) =>
      run(async () => {
        const current = await read();
        await write([...current.filter((item) => item.id !== record.id), record]);
      }),
    clear: (id) =>
      run(async () => {
        const current = await read();
        await write(current.filter((item) => item.id !== id));
      }),
  };
}

const memory = new Map<string, ApprovalRecord>();

const memoryStore: ApprovalStore = {
  async list() {
    return [...memory.values()];
  },
  async save(record) {
    memory.set(record.id, record);
  },
  async clear(id) {
    memory.delete(id);
  },
};

function supabaseStore(supabase: SupabaseClient): ApprovalStore {
  return {
    async list() {
      const { data, error } = await supabase.from("social_approvals").select("unit_id, decision, decided_at");
      if (error) throw new Error(error.message);
      return fileSchema.parse(
        (data ?? []).map((row) => ({
          id: row.unit_id,
          decision: row.decision,
          decidedAt: row.decided_at,
        })),
      );
    },
    async save(record) {
      const { error } = await supabase.from("social_approvals").upsert(
        { unit_id: record.id, decision: record.decision, decided_at: record.decidedAt },
        { onConflict: "unit_id" },
      );
      if (error) throw new Error(error.message);
    },
    async clear(id) {
      const { error } = await supabase.from("social_approvals").delete().eq("unit_id", id);
      if (error) throw new Error(error.message);
    },
  };
}

let backend: "supabase" | "file" | "memory" | null = null;
let supabaseClient: SupabaseClient | null = null;
let fileSingleton: ApprovalStore | null = null;
let fileSingletonPath: string | null = null;

export function resetApprovalStoreForTests() {
  backend = null;
  supabaseClient = null;
  fileSingleton = null;
  fileSingletonPath = null;
  memory.clear();
}

function fileStore() {
  const path = approvalsFilePath();
  if (!fileSingleton || fileSingletonPath !== path) {
    fileSingleton = createFileApprovalStore(path);
    fileSingletonPath = path;
  }
  return fileSingleton;
}

function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function resolveStore(): Promise<ApprovalStore> {
  if (backend === "memory") return memoryStore;
  if (backend === "file") return fileStore();
  if (backend === "supabase" && supabaseClient) return supabaseStore(supabaseClient);

  const forced = process.env.SOCIAL_APPROVALS_STORE;
  if (forced === "memory") {
    backend = "memory";
    return memoryStore;
  }
  if (forced === "file" || !supabaseConfigured()) {
    backend = "file";
    return fileStore();
  }

  const url = process.env.SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.from("social_approvals").select("unit_id").limit(1);
  if (error) {
    console.error("social_approvals is not reachable; using the local approval file");
    backend = "file";
    return fileStore();
  }
  supabaseClient = client;
  backend = "supabase";
  return supabaseStore(client);
}

async function withStore<T>(action: (store: ApprovalStore) => Promise<T>): Promise<T> {
  const store = await resolveStore();
  try {
    return await action(store);
  } catch (error) {
    if (backend === "memory") throw error;
    console.error("approval store failed; keeping decisions in memory for this process", error);
    try {
      for (const record of await fileStore().list()) memory.set(record.id, record);
    } catch {
      // The file is unreadable. Memory keeps only what this process saves next.
    }
    backend = "memory";
    return action(memoryStore);
  }
}

export function listApprovals() {
  return withStore((store) => store.list());
}

export async function setApproval(input: {
  id: string;
  decision: ApprovalDecision | "pending";
  knownIds: ReadonlySet<string>;
  now?: Date;
}): Promise<ApprovalRecord | null> {
  if (!input.knownIds.has(input.id)) throw new UnknownCatalogUnitError(input.id);
  if (input.decision === "pending") {
    await withStore((store) => store.clear(input.id));
    return null;
  }
  const record: ApprovalRecord = {
    id: input.id,
    decision: input.decision,
    decidedAt: (input.now ?? new Date()).toISOString(),
  };
  await withStore((store) => store.save(record));
  return record;
}
