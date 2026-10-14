// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QUIZ_PATH, QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";
import { QuizStickyBar } from "./quiz-sticky-bar";

const nav = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
}));

afterEach(() => {
  nav.pathname = "/";
  sessionStorage.clear();
  delete (window as { gtag?: unknown }).gtag;
});

describe("QuizStickyBar", () => {
  it("links to the quiz with the page slug as utm_content and tracks the click", () => {
    nav.pathname = "/pricing";
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;
    render(<QuizStickyBar />);
    const link = screen.getByRole("link", { name: "Take the quiz" });
    expect(link).toHaveAttribute(
      "href",
      `${QUIZ_PATH}?utm_source=site&utm_medium=sticky-footer&utm_campaign=quiz&utm_content=pricing`,
    );
    expect(screen.getByRole("complementary", { name: "Take the implant candidate quiz" })).toBeInTheDocument();
    fireEvent.click(link);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "quiz_cta_clicked",
      expect.objectContaining({ source: "site", medium: "sticky-footer", campaign: "quiz", content: "pricing" }),
    );
  });

  it("hides on the quiz and thank-you pages", () => {
    nav.pathname = QUIZ_PATH;
    const { rerender } = render(<QuizStickyBar />);
    expect(screen.queryByRole("link", { name: "Take the quiz" })).not.toBeInTheDocument();
    nav.pathname = QUIZ_THANK_YOU_PATH;
    rerender(<QuizStickyBar />);
    expect(screen.queryByRole("link", { name: "Take the quiz" })).not.toBeInTheDocument();
  });

  it("dismisses for the session", () => {
    render(<QuizStickyBar />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss quiz prompt" }));
    expect(screen.queryByRole("link", { name: "Take the quiz" })).not.toBeInTheDocument();
    expect(sessionStorage.getItem("renew:quiz-bar-dismissed")).toBe("1");
    render(<QuizStickyBar />);
    expect(screen.queryByRole("link", { name: "Take the quiz" })).not.toBeInTheDocument();
  });
});
