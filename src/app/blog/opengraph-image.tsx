import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { BLOG_NAME } from "@/lib/blog-schema";

export const alt = `${BLOG_NAME} — ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f1b2d",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#7fd3d8" }}>
          {`${site.name} · Blog`}
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.1, fontWeight: 700 }}>Implant questions, answered plainly.</div>
        <div style={{ fontSize: 28, color: "#c9d3df" }}>{`Orléans · Ottawa · ${site.phone.label}`}</div>
      </div>
    ),
    size,
  );
}
