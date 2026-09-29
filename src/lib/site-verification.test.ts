import { describe, expect, it } from "vitest";
import { getSiteVerification } from "./site-verification";

describe("getSiteVerification", () => {
  it("returns nothing when no tokens are configured", () => {
    expect(getSiteVerification({})).toBeUndefined();
  });

  it("maps Google and Bing tokens to metadata verification", () => {
    expect(
      getSiteVerification({ GOOGLE_SITE_VERIFICATION: "g-token", BING_SITE_VERIFICATION: "b-token" }),
    ).toEqual({ google: "g-token", other: { "msvalidate.01": "b-token" } });
  });

  it("supports Google alone", () => {
    expect(getSiteVerification({ GOOGLE_SITE_VERIFICATION: "g-token" })).toEqual({ google: "g-token" });
  });
});
