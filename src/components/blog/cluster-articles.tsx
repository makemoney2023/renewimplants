import { PostCardList } from "@/components/blog/post-chrome";
import { toPostCard } from "@/lib/blog-cards";
import { postsForHub } from "@/lib/blog-hubs";

export function ClusterArticles({ slug }: { slug: string }) {
  const posts = postsForHub(slug).map(toPostCard);
  if (posts.length === 0) return null;

  return (
    <div className="cluster-articles">
      <PostCardList posts={posts} heading="Related articles" />
    </div>
  );
}
