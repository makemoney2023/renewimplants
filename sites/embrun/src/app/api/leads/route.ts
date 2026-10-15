import { site } from "@/content/load";
import { handleLeadPost } from "@shell/lib/leads";

export function POST(request: Request) {
  return handleLeadPost(request, site);
}
