import { site } from "@/content/load";
import { handleQuizPost } from "@shell/quiz/store";

export function POST(request: Request) {
  return handleQuizPost(request, site);
}
