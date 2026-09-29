import { describe, expect, it } from "vitest";
import { buildIndexNowPayload, extractSitemapUrls, isValidIndexNowKey } from "./indexnow";

describe("IndexNow", () => {
  it("builds the payload with the bare host and a root key file", () => {
    expect(
      buildIndexNowPayload({
        siteUrl: "https://www.renewimplants.ca/",
        key: "fa9c441343d24da61eef7beef48fe5e8",
        urls: ["https://www.renewimplants.ca/blog"],
      }),
    ).toEqual({
      host: "www.renewimplants.ca",
      key: "fa9c441343d24da61eef7beef48fe5e8",
      keyLocation: "https://www.renewimplants.ca/fa9c441343d24da61eef7beef48fe5e8.txt",
      urlList: ["https://www.renewimplants.ca/blog"],
    });
  });

  it("validates key format", () => {
    expect(isValidIndexNowKey("fa9c441343d24da61eef7beef48fe5e8")).toBe(true);
    expect(isValidIndexNowKey("short")).toBe(false);
    expect(isValidIndexNowKey("not-hex-not-hex")).toBe(false);
  });

  it("pulls <loc> URLs out of a sitemap", () => {
    const xml =
      "<urlset><url><loc>https://a.test/</loc></url><url><loc> https://a.test/b </loc></url></urlset>";
    expect(extractSitemapUrls(xml)).toEqual(["https://a.test/", "https://a.test/b"]);
  });
});
