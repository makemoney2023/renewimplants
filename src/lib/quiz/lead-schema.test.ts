import { describe, expect, it } from "vitest";
import { leadRequestSchema, normalizePhone } from "./lead-schema";

const valid = {
  firstName: "Marie",
  email: "marie@example.com",
  phone: "(613) 555-0199",
  preferredContact: "call",
  marketingConsent: false,
  startedAt: 1_700_000_000_000,
  website: "",
  answers: {
    situation: ["dentures"],
    arch: ["upper"],
    frustrations: ["loose", "eating"],
    duration: ["over-5"],
    comfort: ["nervous"],
    payment: ["cdcp"],
    timeline: ["1-3"],
    location: ["orleans"],
  },
  attribution: { utm_source: "blog", utm_medium: "content", landing_path: "/blog/x" },
};

describe("normalizePhone", () => {
  it.each([
    ["(613) 555-0199", "+16135550199"],
    ["613.555.0199", "+16135550199"],
    ["+1 613 555 0199", "+16135550199"],
    ["1-613-555-0199", "+16135550199"],
  ])("normalizes %s", (input, output) => {
    expect(normalizePhone(input)).toBe(output);
  });

  it.each(["555-0199", "12345678901234", "+44 20 7946 0958"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("leadRequestSchema", () => {
  it("accepts a complete submission and normalizes the phone", () => {
    const parsed = leadRequestSchema.parse(valid);
    expect(parsed.phone).toBe("+16135550199");
    expect(parsed.email).toBe("marie@example.com");
  });

  it("strips unknown keys", () => {
    const parsed = leadRequestSchema.parse({ ...valid, leadTier: "hot", isAdmin: true });
    expect(parsed).not.toHaveProperty("leadTier");
    expect(parsed).not.toHaveProperty("isAdmin");
  });

  it("rejects a bad email, phone, and contact method", () => {
    expect(leadRequestSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(leadRequestSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
    expect(leadRequestSchema.safeParse({ ...valid, preferredContact: "fax" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(leadRequestSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });

  it("requires every non-optional question", () => {
    const answers = Object.fromEntries(Object.entries(valid.answers).filter(([id]) => id !== "timeline"));
    expect(leadRequestSchema.safeParse({ ...valid, answers }).success).toBe(false);
  });

  it("allows the optional health question to be skipped or answered", () => {
    expect(leadRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      leadRequestSchema.safeParse({ ...valid, answers: { ...valid.answers, health: ["diabetes"] } }).success,
    ).toBe(true);
  });

  it("rejects unknown option ids and multiple picks on single questions", () => {
    expect(
      leadRequestSchema.safeParse({ ...valid, answers: { ...valid.answers, timeline: ["tomorrow"] } }).success,
    ).toBe(false);
    expect(
      leadRequestSchema.safeParse({ ...valid, answers: { ...valid.answers, arch: ["upper", "lower"] } }).success,
    ).toBe(false);
  });

  it("rejects exclusive options combined with others", () => {
    expect(
      leadRequestSchema.safeParse({ ...valid, answers: { ...valid.answers, health: ["none", "smoker"] } }).success,
    ).toBe(false);
  });
});
