import type { Metadata } from "next";
import { SocialPreview } from "@/components/social-preview/social-preview";
import { site } from "@/content/site";
import { loadSocialPreview } from "@/lib/social-preview";

export const metadata: Metadata = {
  title: `Social preview | ${site.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ post?: string; channel?: string; catalog?: string }>;
};

export default async function SocialPreviewPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const posts = loadSocialPreview();
  const postId = posts.some((post) => post.id === query.post) ? query.post! : "w01-tue";
  const channel = query.channel === "facebook" ? "facebook" : "instagram";

  return (
    <SocialPreview posts={posts} postId={postId} channel={channel} catalogOpen={query.catalog === "1"} />
  );
}
