"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Children, isValidElement } from "react";
import type { BlogCitation } from "@/lib/blog";
import { slugifyHeading } from "@/lib/blog-text";

type ExtractionTableProps = {
  caption: string;
  columns: string[];
  rows: string[][];
};

export function ExtractionTable({ caption, columns, rows }: ExtractionTableProps) {
  return (
    <div className="extraction-table">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                scope="col"
              >
                {column.trim() ? (
                  column
                ) : (
                  <span className="sr-only">Comparison category</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tldr({ children }: { children: ReactNode }) {
  return (
    <aside className="post-tldr" aria-label="Short answer">
      <p className="section-label">Short answer</p>
      {children}
    </aside>
  );
}

export function KeyTakeaways({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="post-takeaways" aria-label="Key takeaways">
      <p className="section-label">Key takeaways</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function BarChart({
  caption,
  unit,
  source,
  points,
}: {
  caption: string;
  unit: string;
  source: string;
  points: { label: string; value: number }[];
}) {
  const max = Math.max(...points.map((point) => point.value), 0);
  return (
    <figure className="bar-chart">
      <figcaption>
        {caption}
        <span>
          {" "}
          ({unit}). Source: {source}
        </span>
      </figcaption>
      <div className="bar-chart-plot" role="img" aria-label={caption}>
        {points.map((point) => (
          <div className="bar-chart-row" key={point.label}>
            <span className="bar-chart-label">{point.label}</span>
            <span className="bar-chart-track">
              <span
                className="bar-chart-fill"
                style={{ width: max > 0 ? `${(point.value / max) * 100}%` : "0%" }}
              />
            </span>
            <span className="bar-chart-value">
              {point.value} {unit}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function Cite({ id, citations }: { id: string; citations: BlogCitation[] }) {
  const index = citations.findIndex((citation) => citation.id === id);
  const citation = citations[index];
  if (!citation) return null;
  return (
    <sup className="post-cite">
      <a href={`#ref-${citation.id}`}>[{index + 1}]</a>
    </sup>
  );
}

export function References({ citations }: { citations: BlogCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <ol className="post-references">
      {citations.map((citation) => (
        <li key={citation.id} id={`ref-${citation.id}`}>
          <a href={citation.url}>{citation.title}</a>
          <span> — {citation.publisher}</span>
        </li>
      ))}
    </ol>
  );
}

export function KeyStat({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <figure className="key-stat">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
      <figcaption>Source: {source}</figcaption>
    </figure>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return Children.toArray(node).map(textOf).join("");
}

export function AnchoredH2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={slugifyHeading(textOf(children))} {...props}>
      {children}
    </h2>
  );
}
