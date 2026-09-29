import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Children, isValidElement } from "react";
import { slugifyHeading } from "@/lib/blog";

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
