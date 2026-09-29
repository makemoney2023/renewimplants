// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoopVideo } from "./loop-video";

let intersectionCallback: IntersectionObserverCallback;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "0px";
  thresholds = [0.25];
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 800px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LoopVideo", () => {
  const sources = {
    video: "/desktop.mp4",
    webm: "/desktop.webm",
    mobileVideo: "/mobile.mp4",
    mobileWebm: "/mobile.webm",
    poster: "/desktop.png",
    mobilePoster: "/mobile.png",
  };

  it("uses the portrait poster on mobile and defers loading until visible", () => {
    const { container } = render(<LoopVideo sources={sources} />);

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("poster", "/mobile.png");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).not.toHaveAttribute("autoplay");
  });

  it("plays only while intersecting and pauses off screen", async () => {
    const { container } = render(<LoopVideo sources={sources} />);
    const video = container.querySelector("video") as HTMLVideoElement;

    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true, intersectionRatio: 1, target: video } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(video.play).toHaveBeenCalledOnce();

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false, intersectionRatio: 0, target: video } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(video.pause).toHaveBeenCalledOnce();
  });
});
