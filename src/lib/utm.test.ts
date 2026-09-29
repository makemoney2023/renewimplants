// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { captureFirstTouch, parseUtm, readAttribution, withUtm } from "./utm";

beforeEach(() => {
  window.localStorage.clear();
});

describe("parseUtm", () => {
  it("reads only the five UTM parameters", () => {
    expect(parseUtm("?utm_source=blog&utm_medium=content&utm_campaign=x&foo=bar")).toEqual({
      utm_source: "blog",
      utm_medium: "content",
      utm_campaign: "x",
    });
  });
});

describe("first-touch attribution", () => {
  it("stores the first landing and keeps it on later visits", () => {
    captureFirstTouch(window.localStorage, { search: "?utm_source=gbp", pathname: "/", referrer: "" }, 1000);
    captureFirstTouch(
      window.localStorage,
      { search: "?utm_source=blog", pathname: "/blog/a", referrer: "" },
      2000,
    );
    expect(readAttribution(window.localStorage, 3000)).toEqual({
      utm_source: "gbp",
      landing_path: "/",
    });
  });

  it("expires after 30 days", () => {
    captureFirstTouch(window.localStorage, { search: "?utm_source=gbp", pathname: "/", referrer: "" }, 0);
    const thirtyOneDays = 31 * 24 * 60 * 60 * 1000;
    expect(readAttribution(window.localStorage, thirtyOneDays)).toBeNull();
  });

  it("records an external referrer host", () => {
    captureFirstTouch(
      window.localStorage,
      { search: "", pathname: "/faq", referrer: "https://chatgpt.com/c/123" },
      0,
    );
    expect(readAttribution(window.localStorage, 1)).toEqual({
      landing_path: "/faq",
      referrer: "chatgpt.com",
    });
  });

  it("survives corrupt storage", () => {
    window.localStorage.setItem("renew:attribution", "{nope");
    expect(readAttribution(window.localStorage, 0)).toBeNull();
  });
});

describe("withUtm", () => {
  it("appends UTM parameters to an internal path", () => {
    expect(withUtm("/implant-candidate-quiz", { utm_source: "blog", utm_medium: "sticky", utm_campaign: "a b" })).toBe(
      "/implant-candidate-quiz?utm_source=blog&utm_medium=sticky&utm_campaign=a+b",
    );
  });
});
