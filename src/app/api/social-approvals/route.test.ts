import { beforeEach, describe, expect, it, vi } from "vitest";

const listApprovals = vi.fn();
const setApproval = vi.fn();

vi.mock("@/lib/social-approval", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/social-approval")>()),
  listApprovals,
  setApproval,
}));

const { GET, POST } = await import("./route");

function post(payload: unknown) {
  return new Request("http://localhost/api/social-approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

beforeEach(() => {
  listApprovals.mockReset();
  setApproval.mockReset();
  listApprovals.mockResolvedValue([]);
  setApproval.mockResolvedValue({
    id: "w01-tue",
    decision: "approved",
    decidedAt: "2026-10-05T12:00:00.000Z",
  });
});

describe("GET /api/social-approvals", () => {
  it("returns stored decisions", async () => {
    listApprovals.mockResolvedValue([
      { id: "ad-01", decision: "not-approved", decidedAt: "2026-10-05T12:00:00.000Z" },
    ]);
    const response = await GET(new Request("http://localhost/api/social-approvals"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      decisions: [{ id: "ad-01", decision: "not-approved", decidedAt: "2026-10-05T12:00:00.000Z" }],
    });
  });

  it("queues approved units that have media and leaves the rest out", async () => {
    listApprovals.mockResolvedValue([
      { id: "w01-tue", decision: "approved", decidedAt: "2026-10-05T12:00:00.000Z" },
      { id: "ad-01", decision: "not-approved", decidedAt: "2026-10-05T12:00:00.000Z" },
    ]);
    const response = await GET(new Request("http://localhost/api/social-approvals?queue=1"));
    expect(response.status).toBe(200);
    const body = await response.json();
    const ids = body.queue.map((item: { id: string }) => item.id);
    expect(ids).toContain("w01-tue");
    expect(ids).not.toContain("ad-01");
    const queued = body.queue.find((item: { id: string }) => item.id === "w01-tue");
    expect(queued.decision).toBe("approved");
    expect(queued.publishable).toBe(true);
    expect(queued.scheduledAt).toBeNull();
    expect(queued.postedAt).toBeNull();
    expect(queued.video).toBe("https://renewimplants.vercel.app/media/social/w01-tue.mp4?v=2");
    expect(queued.instagramHref).toContain("https://renewimplants.vercel.app/implant-candidate-quiz");
  });
});

describe("POST /api/social-approvals", () => {
  it("stores an approval for a known unit", async () => {
    const response = await POST(post({ id: "w01-tue", decision: "approved" }));
    expect(response.status).toBe(200);
    expect(setApproval).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w01-tue", decision: "approved", knownIds: expect.any(Set) }),
    );
    expect(await response.json()).toEqual({
      decision: { id: "w01-tue", decision: "approved", decidedAt: "2026-10-05T12:00:00.000Z" },
    });
  });

  it("rejects an unknown catalog id", async () => {
    const { UnknownCatalogUnitError } = await import("@/lib/social-approval");
    setApproval.mockRejectedValue(new UnknownCatalogUnitError("not-a-unit"));
    const response = await POST(post({ id: "not-a-unit", decision: "approved" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Unknown catalog unit: not-a-unit" });
  });

  it("returns 400 for a missing decision", async () => {
    const response = await POST(post({ id: "w01-tue" }));
    expect(response.status).toBe(400);
    expect(setApproval).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(post("{not json"));
    expect(response.status).toBe(400);
  });

  it("accepts the preview form and returns to the same catalog page", async () => {
    const body = new URLSearchParams({
      id: "ad-01",
      decision: "not-approved",
      redirect: "/social-preview?post=ad-01&catalog=1",
    });
    const response = await POST(
      new Request("http://localhost/api/social-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/social-preview?post=ad-01&catalog=1");
    expect(setApproval).toHaveBeenCalledWith(
      expect.objectContaining({ id: "ad-01", decision: "not-approved" }),
    );
  });

  it("rejects a redirect that leaves the preview", async () => {
    const body = new URLSearchParams({
      id: "ad-01",
      decision: "approved",
      redirect: "https://example.com/social-preview",
    });
    const response = await POST(
      new Request("http://localhost/api/social-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }),
    );
    expect(response.status).toBe(400);
    expect(setApproval).not.toHaveBeenCalled();
  });
});
