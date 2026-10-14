import { describe, expect, it } from "vitest";
import { insertPostFigures } from "./blog-figures";

const body = `Intro

## First section?

Paragraph one.

## Second section?

Paragraph two.

## Third section?

Paragraph three.
`;

describe("insertPostFigures", () => {
  it("places each figure after its heading's section", () => {
    const next = insertPostFigures(body, [
      { heading: "First section?", src: "/media/blog/post-2.jpg", alt: "A diner" },
      { heading: "Third section?", src: "/media/blog/post-3.jpg", alt: 'A market "stall"' },
    ]);
    const second = next.indexOf("## Second section?");
    const third = next.indexOf("## Third section?");
    expect(next.indexOf("/media/blog/post-2.jpg")).toBeLessThan(second);
    expect(next.indexOf("## First section?")).toBeLessThan(next.indexOf("/media/blog/post-2.jpg"));
    expect(next.indexOf("/media/blog/post-3.jpg")).toBeGreaterThan(third);
    expect(next).toContain('alt="A market &quot;stall&quot;"');
  });

  it("fails when the heading is missing", () => {
    expect(() =>
      insertPostFigures(body, [{ heading: "Missing?", src: "/a.jpg", alt: "Alt" }]),
    ).toThrow(/Missing/);
  });
});
