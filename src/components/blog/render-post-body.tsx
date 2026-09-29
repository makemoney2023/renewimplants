import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { QuizCta } from "@/components/quiz/quiz-cta";
import type { BlogPost } from "@/lib/blog";
import { AnchoredH2, ExtractionTable, KeyStat } from "./mdx-components";

const BLOG_CTA_INTRO =
  "Not sure which option fits your mouth? Nine questions, no obligation, and a personalized next step.";

export async function renderPostBody(post: BlogPost) {
  const { default: Content } = await evaluate(post.body, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  });

  return (
    <Content
      components={{
        h2: AnchoredH2,
        ExtractionTable,
        KeyStat,
        BlogCta: (props: { label?: string }) => (
          <QuizCta
            source="blog"
            medium="content"
            campaign={post.slug}
            label={props.label ?? post.quizCtaLabel}
            intro={BLOG_CTA_INTRO}
          />
        ),
      }}
    />
  );
}
