import { beforeEach, describe, expect, it, vi } from "vitest";

const insertQuizLead = vi.fn();
vi.mock("@/lib/quiz/lead-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/quiz/lead-store")>()),
  insertQuizLead,
}));

const { POST } = await import("./route");

const NOW = 1_800_000_000_000;

const body = {
  firstName: "Marie",
  email: "marie@example.com",
  phone: "613-555-0199",
  preferredContact: "call",
  marketingConsent: false,
  startedAt: NOW - 60_000,
  website: "",
  answers: {
    situation: ["many"],
    arch: ["both"],
    frustrations: ["eating"],
    duration: ["1-5"],
    comfort: ["very-anxious"],
    payment: ["cdcp"],
    timeline: ["asap"],
    location: ["orleans"],
  },
};

function request(payload: unknown) {
  return new Request("http://localhost/api/quiz-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

beforeEach(() => {
  insertQuizLead.mockReset();
  insertQuizLead.mockResolvedValue({ id: "lead-1" });
  vi.spyOn(Date, "now").mockReturnValue(NOW);
});

describe("POST /api/quiz-leads", () => {
  it("stores the lead with a server-computed result and returns 201", async () => {
    const response = await POST(request({ ...body, leadTier: "nurture" }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "lead-1",
      resultPath: "full-arch",
      modifiers: ["sedation", "coverage"],
      leadTier: "hot",
    });
    expect(insertQuizLead).toHaveBeenCalledWith(
      expect.objectContaining({ phone: "+16135550199", lead_tier: "hot", lead_score: 90, result_path: "full-arch" }),
    );
  });

  it("returns 400 with field messages for invalid input", async () => {
    const response = await POST(request({ ...body, email: "nope" }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Please check the highlighted fields.");
    expect(json.fields.email).toBe("Please enter a valid email");
    expect(insertQuizLead).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
  });

  it("rejects bots that fill the honeypot", async () => {
    const response = await POST(request({ ...body, website: "spam" }));
    expect(response.status).toBe(400);
    expect(insertQuizLead).not.toHaveBeenCalled();
  });

  it("rejects submissions completed faster than a human can", async () => {
    const response = await POST(request({ ...body, startedAt: NOW - 500 }));
    expect(response.status).toBe(400);
    expect(insertQuizLead).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking internals when storage fails", async () => {
    insertQuizLead.mockRejectedValue(new Error("connection refused to db.internal:5432"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request(body));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toMatch(/613-841-6111/);
    expect(JSON.stringify(json)).not.toContain("db.internal");
  });
});
