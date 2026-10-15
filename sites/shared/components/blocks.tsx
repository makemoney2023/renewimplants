import type { ReactNode } from "react";
import { Inline } from "@shell/lib/inline";
import { mediaUrl } from "@shell/lib/media";
import { findForm } from "@shell/lib/leads";
import type { Block, ClinicPage, ClinicSite } from "@shell/types";
import { LeadForm } from "./lead-form";

export function sameHeading(left: string, right: string) {
  return fold(left) === fold(right);
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function videoMode(src: string) {
  return src.toLowerCase().includes("interview") ? "interview" : "banner";
}

export function Blocks({
  site,
  page,
  blocks,
}: {
  site: ClinicSite;
  page: ClinicPage;
  blocks: Block[];
}) {
  const nodes: ReactNode[] = [];
  let skippedVideo = false;

  blocks.forEach((block, index) => {
    if (block.type === "heading" && sameHeading(block.text, page.h1)) return;
    if (
      block.type === "video" &&
      page.video &&
      block.src === page.video &&
      !skippedVideo
    ) {
      skippedVideo = true;
      return;
    }
    nodes.push(
      <BlockView key={`${block.type}-${index}`} site={site} page={page} block={block} />,
    );
  });

  return <>{nodes}</>;
}

function BlockView({
  site,
  page,
  block,
}: {
  site: ClinicSite;
  page: ClinicPage;
  block: Block;
}) {
  if (block.type === "heading") {
    const level = Math.min(6, Math.max(2, block.level || 2));
    const Tag = `h${level}` as "h2";
    return <Tag>{block.text}</Tag>;
  }

  if (block.type === "paragraph") {
    if (!block.html.trim()) return null;
    return (
      <p>
        <Inline html={block.html} />
      </p>
    );
  }

  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={index}>
            <Inline html={item} />
          </li>
        ))}
      </Tag>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="prose-photo">
        <img src={mediaUrl(block.src)} alt={block.alt || ""} />
      </figure>
    );
  }

  if (block.type === "gallery") {
    return (
      <ul className="gallery-grid">
        {block.images.map((image) => (
          <li key={image.src}>
            <img src={mediaUrl(image.src)} alt={image.alt || ""} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "video") {
    return <Video src={block.src} />;
  }

  if (block.type === "faq") {
    return (
      <div className="faq-list">
        {block.items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>
              <Inline html={item.a} />
            </p>
          </details>
        ))}
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <p className="page-actions">
        <a className="button button-primary" href={block.href}>
          {block.label}
        </a>
      </p>
    );
  }

  if (block.type === "hours") {
    return <Hours rows={block.rows} />;
  }

  if (block.type === "form") {
    const form = findForm(site, block.id);
    if (!form) return null;
    return <LeadForm form={form} pagePath={page.path} />;
  }

  if (block.type === "quotes") {
    return (
      <div className="testimonial-grid">
        {block.items.map((item, index) => (
          <figure key={`${item.quote}-${index}`}>
            <blockquote className="quote-text">{item.quote}</blockquote>
            {item.name ? <figcaption>{item.name}</figcaption> : null}
          </figure>
        ))}
      </div>
    );
  }

  if (block.type === "table") {
    return (
      <table className="data-table">
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) =>
                index === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>,
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return null;
}

export function Video({ src }: { src: string }) {
  const url = mediaUrl(src);
  if (videoMode(src) === "interview") {
    return (
      <div className="interview-player">
        <video controls preload="metadata" src={url} />
      </div>
    );
  }

  return (
    <video autoPlay muted loop playsInline src={url} aria-hidden="true" />
  );
}

export function Hours({ rows }: { rows: Array<{ day: string; time: string }> }) {
  return (
    <dl className="office-hours">
      {rows.map((row) => (
        <div key={row.day}>
          <dt>{row.day}</dt>
          <dd>{row.time}</dd>
        </div>
      ))}
    </dl>
  );
}

export function h1Class(text: string) {
  return text.trim().length > 42 ? "h1-long" : undefined;
}
