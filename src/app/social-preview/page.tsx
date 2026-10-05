import type { Metadata } from "next";
import { SocialPreview } from "@/components/social-preview/social-preview";
import { site } from "@/content/site";
import { listApprovals } from "@/lib/social-approval";
import { loadSocialPreview } from "@/lib/social-preview";
import { parseLibraryQuery } from "@/lib/social-preview-model";

export const metadata: Metadata = {
  title: `Social preview | ${site.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    post?: string;
    channel?: string;
    catalog?: string;
    view?: string;
    lane?: string;
    format?: string;
    state?: string;
    approval?: string;
    pillar?: string;
    week?: string;
    sort?: string;
    q?: string;
  }>;
};

export default async function SocialPreviewPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const posts = loadSocialPreview();
  const decisions = await listApprovals();
  const postId = posts.some((post) => post.id === query.post) ? query.post! : "w01-tue";
  const channel = query.channel === "facebook" ? "facebook" : "instagram";
  const view = query.view === "library" ? "library" : "post";
  const library = parseLibraryQuery(query);

  return (
    <SocialPreview
      posts={posts}
      postId={postId}
      channel={channel}
      catalogOpen={query.catalog === "1"}
      view={view}
      library={library}
      decisions={decisions}
    />
  );
}
