// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { FUNNEL_EVENTS, track } from "./analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

afterEach(() => {
  delete window.gtag;
});

describe("track", () => {
  it("sends a GA4 event with its properties", () => {
    window.gtag = vi.fn();
    track(FUNNEL_EVENTS.generate_lead, { result_path: "full-arch" });
    expect(window.gtag).toHaveBeenCalledWith("event", "generate_lead", {
      result_path: "full-arch",
    });
  });

  it("is a silent no-op when GA is not loaded", () => {
    expect(() => track(FUNNEL_EVENTS.quiz_started)).not.toThrow();
  });

  it("uses GA4's recommended name for leads", () => {
    expect(FUNNEL_EVENTS.generate_lead).toBe("generate_lead");
  });
});
