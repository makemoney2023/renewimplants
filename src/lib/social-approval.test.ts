import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SocialPreviewPost } from "./social-preview-model";
import {
  buildApprovalQueue,
  createFileApprovalStore,
  listApprovals,
  resetApprovalStoreForTests,
  setApproval,
  UnknownCatalogUnitError,
} from "./social-approval";

const decidedAt = "2026-10-05T15:00:00.000Z";

function post(id: string, ready: boolean): SocialPreviewPost {
  return {
    id,
    lane: "paid",
    format: "static",
    label: id,
    caption: "Caption for the unit.",
    onScreen: "On screen",
    ctaLabel: "Take the two-minute quiz",
    instagramHref: "https://renewimplants.vercel.app/implant-candidate-quiz?utm_campaign=test",
    facebookHref: "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=facebook",
    video: ready ? `/media/social/${id}.mp4?v=2` : null,
    poster: ready ? `/media/social/${id}-poster.jpg` : null,
    images: null,
    week: null,
    weekday: null,
    pillar: "patient-education",
  };
}

describe("social approval store", () => {
  it("round-trips a decision and clears it back to pending", async () => {
    const dir = await mkdtemp(join(tmpdir(), "social-approvals-"));
    const store = createFileApprovalStore(join(dir, "social-approvals.json"));
    await store.save({ id: "ad-01", decision: "approved", decidedAt });
    await store.save({ id: "ad-02", decision: "not-approved", decidedAt });
    await store.save({ id: "ad-01", decision: "not-approved", decidedAt: "2026-10-05T16:00:00.000Z" });

    const listed = await store.list();
    expect(listed).toEqual([
      { id: "ad-02", decision: "not-approved", decidedAt },
      { id: "ad-01", decision: "not-approved", decidedAt: "2026-10-05T16:00:00.000Z" },
    ]);

    await store.clear("ad-01");
    expect(await store.list()).toEqual([{ id: "ad-02", decision: "not-approved", decidedAt }]);
    const raw = await readFile(join(dir, "social-approvals.json"), "utf8");
    expect(JSON.parse(raw)).toHaveLength(1);
  });

  it("rejects an id that is not in the catalog", async () => {
    await expect(
      setApproval({ id: "nope", decision: "approved", knownIds: new Set(["ad-01"]) }),
    ).rejects.toBeInstanceOf(UnknownCatalogUnitError);
  });

  it("persists a known unit and clears it when the decision is pending", async () => {
    const dir = await mkdtemp(join(tmpdir(), "social-approvals-"));
    process.env.SOCIAL_APPROVALS_STORE = "file";
    process.env.SOCIAL_APPROVALS_PATH = join(dir, "approvals.json");
    resetApprovalStoreForTests();
    const knownIds = new Set(["ad-01"]);
    const now = new Date(decidedAt);

    expect(await setApproval({ id: "ad-01", decision: "approved", knownIds, now })).toEqual({
      id: "ad-01",
      decision: "approved",
      decidedAt,
    });
    expect(await listApprovals()).toEqual([{ id: "ad-01", decision: "approved", decidedAt }]);
    expect(await setApproval({ id: "ad-01", decision: "pending", knownIds, now })).toBeNull();
    expect(await listApprovals()).toEqual([]);

    delete process.env.SOCIAL_APPROVALS_STORE;
    delete process.env.SOCIAL_APPROVALS_PATH;
    resetApprovalStoreForTests();
  });
});

describe("approval queue", () => {
  it("includes approved rendered units and drops the rest", () => {
    const posts = [post("ready", true), post("waiting", false), post("held", true)];
    const queue = buildApprovalQueue(posts, [
      { id: "ready", decision: "approved", decidedAt },
      { id: "waiting", decision: "approved", decidedAt },
      { id: "held", decision: "not-approved", decidedAt },
    ]);
    expect(queue.map((item) => item.id)).toEqual(["ready"]);
    expect(queue[0]).toMatchObject({
      decision: "approved",
      publishable: true,
      scheduledAt: null,
      postedAt: null,
      video: "https://renewimplants.vercel.app/media/social/ready.mp4?v=2",
      poster: "https://renewimplants.vercel.app/media/social/ready-poster.jpg",
    });
  });
});
