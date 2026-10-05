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

function previewRedirect(request: Request, redirect: string | null) {
  if (!redirect || !redirect.startsWith("/social-preview") || redirect.startsWith("//") || redirect.includes("\\")) {
    return null;
  }
  const url = new URL(redirect, request.url);
  if (url.origin !== new URL(request.url).origin || url.pathname !== "/social-preview") return null;
  return url;
}

function invalidDecision() {
  return Response.json({ error: "Send a catalog id and a decision." }, { status: 400 });
}

async function readDecision(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return { ok: false as const, error: invalidDecision() };
    }
    const parsed = approvalRequestSchema.safeParse(payload);
    if (!parsed.success) return { ok: false as const, error: invalidDecision() };
    return { ok: true as const, ...parsed.data, redirect: null as string | null };
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { ok: false as const, error: invalidDecision() };
  }
  const parsed = approvalRequestSchema.safeParse({
    id: form.get("id"),
    decision: form.get("decision"),
  });
  if (!parsed.success) return { ok: false as const, error: invalidDecision() };
  const redirect = form.get("redirect");
  return { ok: true as const, ...parsed.data, redirect: typeof redirect === "string" ? redirect : null };
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

export async function POST(request: Request): Promise<Response> {
  const input = await readDecision(request);
  if (!input.ok) return input.error;

  const destination = input.redirect ? previewRedirect(request, input.redirect) : null;
  if (input.redirect && !destination) {
    return Response.json({ error: "Stay on the social preview." }, { status: 400 });
  }

  try {
    const decision = await setApproval({ id: input.id, decision: input.decision, knownIds: knownIds() });
    if (destination) return Response.redirect(destination, 303);
    return Response.json({ decision });
  } catch (error) {
    if (error instanceof UnknownCatalogUnitError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("social approval could not be stored", error);
    return Response.json({ error: "The approval could not be saved." }, { status: 500 });
  }
}
