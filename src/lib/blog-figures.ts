export type BodyFigure = {
  heading: string;
  src: string;
  alt: string;
};

function escapeAttr(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

/** Insert each figure after the section whose H2 matches `heading`, before the next heading. */
export function insertPostFigures(body: string, figures: BodyFigure[]) {
  const insertions: { index: number; markup: string }[] = [];

  for (const figure of figures) {
    const heading = `## ${figure.heading}`;
    const start = body.indexOf(heading);
    if (start === -1) {
      throw new Error(`No heading for body image: ${figure.heading}`);
    }
    const nextHeading = body.indexOf("\n## ", start + heading.length);
    const index = nextHeading === -1 ? body.length : nextHeading;
    insertions.push({
      index,
      markup: `\n\n<PostFigure src="${escapeAttr(figure.src)}" alt="${escapeAttr(figure.alt)}" />\n`,
    });
  }

  return insertions
    .toSorted((a, b) => b.index - a.index)
    .reduce((next, item) => next.slice(0, item.index) + item.markup + next.slice(item.index), body);
}
