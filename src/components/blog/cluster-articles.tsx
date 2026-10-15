import { PostCardList } from "@/components/blog/post-chrome";
import { site } from "@/content/site";
import { toPostCard } from "@/lib/blog-cards";
import { postsForHub } from "@/lib/blog-hubs";

export function ClusterArticles({ slug }: { slug: string }) {
  // Clinic builds reuse this component with their own site config. Their posts
  // are not Renew's clusters, so the related-article row stays on Renew only.
  if (site.url !== "https://www.renewimplants.ca") return null;

  const posts = postsForHub(slug).map(toPostCard);
  if (posts.length === 0) return null;

  return (
    <div className="cluster-articles">
      <PostCardList posts={posts} heading="Related articles" />
    </div>
  );
}
