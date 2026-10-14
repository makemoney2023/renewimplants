import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { getAllPosts, getPost } from "@/lib/blog";

export const alt = `${site.name} blog`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

async function heroDataUrl(slug: string) {
  try {
    const bytes = await readFile(join(process.cwd(), "assets", "blog", `${slug}.jpg`));
    return `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const background = await heroDataUrl(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0f1b2d",
          color: "#ffffff",
        }}
      >
        {background ? (
          <img
            alt=""
            src={background}
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 72,
            background: background
              ? "linear-gradient(180deg, rgba(15,27,45,0.12) 0%, rgba(15,27,45,0.88) 76%)"
              : "#0f1b2d",
          }}
        >
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#7fd3d8" }}>
            {`${site.name} · Blog`}
          </div>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700 }}>{post?.title ?? site.name}</div>
          <div style={{ fontSize: 28, color: "#c9d3df" }}>{`Orléans · Ottawa · ${site.phone.label}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
