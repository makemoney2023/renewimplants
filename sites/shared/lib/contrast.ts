/** Relative luminance contrast, WCAG 2.x. */
export function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((index) => {
    const channel = Number.parseInt(value.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function readThemeTokens(css: string) {
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[match[1]] = match[2].toLowerCase();
  }
  return tokens;
}
