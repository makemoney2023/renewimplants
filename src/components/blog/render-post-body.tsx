import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { QuizCta } from "@/components/quiz/quiz-cta";
import type { BlogPost } from "@/lib/blog";
import { insertPostFigures } from "@/lib/blog-figures";
import {
  AnchoredH2,
  BarChart,
  Cite,
  ExtractionTable,
  KeyStat,
  KeyTakeaways,
  References,
  Tldr,
} from "./mdx-components";
import { PostFigure } from "./post-figure";

const BLOG_CTA_INTRO =
  "Not sure which option fits your mouth? Nine questions, no obligation, and a personalized next step.";

export async function renderPostBody(post: BlogPost) {
  const figures = post.imagePrompts
    .filter((item) => item.aspectRatio === "4:3")
    .slice(0, 2)
    .map((item, index) => ({
      heading: item.placement,
      src: `/media/blog/${post.slug}-${index + 2}.jpg`,
      alt: item.alt,
    }));
  const { default: Content } = await evaluate(insertPostFigures(post.body, figures), {
    ...runtime,
    remarkPlugins: [remarkGfm],
  });

  return (
    <Content
      components={{
        h2: AnchoredH2,
        PostFigure,
        ExtractionTable,
        KeyStat,
        BarChart,
        Tldr,
        Cite: ({ id }: { id: string }) => <Cite id={id} citations={post.citations} />,
        References: () => <References citations={post.citations} />,
        KeyTakeaways: () => <KeyTakeaways items={post.takeaways ?? []} />,
        BlogCta: (props: { label?: string }) => (
          <QuizCta
            source="blog"
            medium="content"
            campaign={post.slug}
            content={post.slug}
            label={props.label ?? post.quizCtaLabel}
            intro={BLOG_CTA_INTRO}
          />
        ),
      }}
    />
  );
}
