export function getRailDistance(trackWidth: number, viewportWidth: number) {
  return Math.max(0, trackWidth - viewportWidth);
}

export function getImageMotion(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      scale: 1,
      xPercent: 0,
      yPercent: 0,
    };
  }

  return {
    scale: 1.1,
    xPercent: 0,
    yPercent: -6,
  };
}
