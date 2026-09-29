// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import { ScrollWorld } from "./scroll-world";

vi.mock("@gsap/react", () => ({ useGSAP: () => undefined }));
vi.mock("gsap", () => ({ default: { registerPlugin: () => undefined } }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});

describe("ScrollWorld hero", () => {
  it("offers the free consultation and the candidate quiz as the two hero actions", () => {
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;
    render(<ScrollWorld />);

    const hero = screen.getByRole("heading", { level: 1 }).closest(".hero-copy") as HTMLElement;
    const links = within(hero).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      site.primaryCta.href,
      `${QUIZ_PATH}?utm_source=site&utm_medium=hero&utm_campaign=home`,
    ]);
    expect(links[1]).toHaveTextContent("Take the 2-minute implant quiz");

    fireEvent.click(links[1]);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "quiz_cta_clicked",
      expect.objectContaining({ source: "site", medium: "hero", campaign: "home" }),
    );
  });
});
