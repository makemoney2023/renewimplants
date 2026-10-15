import { leadSite } from "@/content/site";
import { handleQuizPost } from "@shell/quiz/store";

export function POST(request: Request) {
  return handleQuizPost(request, leadSite);
}
