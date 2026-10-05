import { loadSocialPreview } from "@/lib/social-preview";
import {
  approvalRequestSchema,
  buildApprovalQueue,
  listApprovals,
  setApproval,
  UnknownCatalogUnitError,
} from "@/lib/social-approval";

function knownIds() {
  return new Set(loadSocialPreview().map((post) => post.id));
}

export async function GET(request: Request) {
  try {
    const records = await listApprovals();
    const queue = new URL(request.url).searchParams.get("queue") === "1";
    if (queue) {
      return Response.json({ queue: buildApprovalQueue(loadSocialPreview(), records) });
    }
    return Response.json({ decisions: records });
  } catch (error) {
    console.error("social approvals could not be read", error);
    return Response.json({ error: "Approvals could not be read." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send a catalog id and a decision." }, { status: 400 });
  }

  const parsed = approvalRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Send a catalog id and a decision." }, { status: 400 });
  }

  try {
    const decision = await setApproval({ ...parsed.data, knownIds: knownIds() });
    return Response.json({ decision });
  } catch (error) {
    if (error instanceof UnknownCatalogUnitError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("social approval could not be stored", error);
    return Response.json({ error: "The approval could not be saved." }, { status: 500 });
  }
}
