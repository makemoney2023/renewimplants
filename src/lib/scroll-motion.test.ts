import { describe, expect, it } from "vitest";
import { getImageMotion, getRailDistance } from "./scroll-motion";

describe("scroll-world motion", () => {
  it("calculates only the horizontal rail overflow", () => {
    expect(getRailDistance(3200, 1440)).toBe(1760);
    expect(getRailDistance(800, 1440)).toBe(0);
  });

  it("settles every image when reduced motion is requested", () => {
    expect(getImageMotion(true)).toEqual({
      scale: 1,
      xPercent: 0,
      yPercent: 0,
    });
  });

  it("gives normal motion a restrained depth range", () => {
    const motion = getImageMotion(false);
    expect(motion.scale).toBeGreaterThan(1);
    expect(motion.scale).toBeLessThanOrEqual(1.12);
    expect(Math.abs(motion.yPercent)).toBeLessThanOrEqual(8);
  });
});
