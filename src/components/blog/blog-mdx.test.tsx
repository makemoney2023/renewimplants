// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllPosts } from "@/lib/blog";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { ExtractionTable, KeyStat } from "./mdx-components";
import { renderPostBody } from "./render-post-body";

afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});

describe("ExtractionTable", () => {
  it("renders a real table with a caption and column headers", () => {
    render(<ExtractionTable caption="Compare" columns={["A", "B"]} rows={[["1", "2"]]} />);
    const table = screen.getByRole("table", { name: "Compare" });
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["A", "B"]);
    expect(screen.getByRole("rowheader", { name: "1" })).toBeInTheDocument();
  });

  it("gives an empty comparison header an accessible name", () => {
    render(<ExtractionTable caption="Compare" columns={["", "Option"]} rows={[["Cost", "$"]]} />);
    expect(
      screen.getByRole("columnheader", { name: "Comparison category" }),
    ).toBeInTheDocument();
  });
});

describe("KeyStat", () => {
  it("renders the figure, its label, and its source", () => {
    render(<KeyStat value="99%" label="survival" source="Study 2020" />);
    expect(screen.getByText("99%").tagName).toBe("DD");
    expect(screen.getByText("survival").tagName).toBe("DT");
    expect(screen.getByText(/Study 2020/)).toBeInTheDocument();
  });
});

describe("QuizCta", () => {
  it("links to the quiz with blog UTM tags and tracks the click", () => {
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;
    render(<QuizCta source="blog" medium="content" campaign="my-post" label="Take it" />);
    const link = screen.getByRole("link", { name: /Take it/ });
    expect(link).toHaveAttribute(
      "href",
      `${QUIZ_PATH}?utm_source=blog&utm_medium=content&utm_campaign=my-post`,
    );
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    fireEvent.click(link);
    expect(gtag).toHaveBeenCalledWith("event", "quiz_cta_clicked", expect.objectContaining({ source: "blog", medium: "content", campaign: "my-post" }));
  });
});

describe("renderPostBody", () => {
  it.each(getAllPosts().map((post) => [post.slug, post] as const))(
    "compiles %s with anchored headings, a table, and a quiz link",
    async (_slug, post) => {
      const html = renderToStaticMarkup(await renderPostBody(post));
      for (const heading of post.headings) expect(html).toContain(`id="${heading.id}"`);
      expect(html).toContain("<table");
      expect(html).toContain(`href="${QUIZ_PATH}?utm_source=blog`);
    },
  );
});
