import type { ReactNode } from "react";

type InlineNode =
  | { type: "text"; text: string }
  | { type: "br" }
  | { type: "strong" | "em"; children: InlineNode[] }
  | { type: "a"; href: string; children: InlineNode[] };

const TOKEN = /(<a\s+href="[^"]*">|<\/a>|<strong>|<\/strong>|<em>|<\/em>|<br\s*\/?>)/gi;

/** Render the small HTML subset the extractor keeps. Anything else is text. */
export function Inline({ html }: { html: string }) {
  return <>{renderNodes(parseInline(html))}</>;
}

function parseInline(html: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const stack: InlineNode[][] = [nodes];
  const anchors: string[] = [];
  const parts = html.split(TOKEN).filter((part) => part !== "");

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower.startsWith("<a ")) {
      const href = part.match(/href="([^"]*)"/i)?.[1] ?? "";
      const node: InlineNode = { type: "a", href, children: [] };
      stack[stack.length - 1].push(node);
      stack.push(node.children);
      anchors.push(href);
      continue;
    }
    if (lower === "</a>") {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (lower === "<strong>" || lower === "<em>") {
      const node: InlineNode = { type: lower === "<strong>" ? "strong" : "em", children: [] };
      stack[stack.length - 1].push(node);
      stack.push(node.children);
      continue;
    }
    if (lower === "</strong>" || lower === "</em>") {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (lower.startsWith("<br")) {
      stack[stack.length - 1].push({ type: "br" });
      continue;
    }
    stack[stack.length - 1].push({ type: "text", text: decode(part) });
  }

  return nodes;
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function renderNodes(nodes: InlineNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.text;
    if (node.type === "br") return <br key={index} />;
    if (node.type === "strong") return <strong key={index}>{renderNodes(node.children)}</strong>;
    if (node.type === "em") return <em key={index}>{renderNodes(node.children)}</em>;
    if (node.type !== "a") return null;
    const external = node.href.startsWith("http");
    return (
      <a
        key={index}
        href={node.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {renderNodes(node.children)}
      </a>
    );
  });
}
