"use client";

import { createContext, use, useMemo, useState } from "react";
import type { ApprovalDecision, ApprovalRecord, ApprovalStatus } from "@/lib/social-approval";
import {
  postIsReady,
  socialPreviewHref,
  type LibraryQuery,
  type SocialPreviewChannel,
  type SocialPreviewPost,
} from "@/lib/social-preview-model";

type ApprovalContextValue = {
  status: (id: string) => ApprovalStatus;
  decide: (id: string, decision: ApprovalDecision) => void;
  savingId: string | null;
  errorId: string | null;
};

const ApprovalContext = createContext<ApprovalContextValue | null>(null);

function useApproval() {
  const value = use(ApprovalContext);
  if (!value) throw new Error("Approval controls need ApprovalProvider.");
  return value;
}

export function ApprovalProvider({
  initial,
  children,
}: {
  initial: ApprovalRecord[];
  children: React.ReactNode;
}) {
  const [records, setRecords] = useState<ApprovalRecord[]>(initial);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const value = useMemo<ApprovalContextValue>(() => {
    return {
      status(id) {
        return records.find((record) => record.id === id)?.decision ?? "pending";
      },
      decide(id, decision) {
        const current = records.find((record) => record.id === id)?.decision ?? "pending";
        const next: ApprovalStatus = current === decision ? "pending" : decision;
        const previous = records;
        setErrorId((currentId) => (currentId === id ? null : currentId));
        setSavingId(id);
        setRecords((list) => {
          const rest = list.filter((record) => record.id !== id);
          if (next === "pending") return rest;
          return [...rest, { id, decision: next, decidedAt: new Date().toISOString() }];
        });
        void fetch("/api/social-approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decision: next }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error("save failed");
            const body = (await response.json()) as { decision: ApprovalRecord | null };
            setRecords((list) => {
              const rest = list.filter((record) => record.id !== id);
              return body.decision ? [...rest, body.decision] : rest;
            });
          })
          .catch(() => {
            setRecords((list) => {
              const rest = list.filter((record) => record.id !== id);
              const prior = previous.find((record) => record.id === id);
              return prior ? [...rest, prior] : rest;
            });
            setErrorId(id);
          })
          .finally(() => {
            setSavingId((currentId) => (currentId === id ? null : currentId));
          });
      },
      savingId,
      errorId,
    };
  }, [records, savingId, errorId]);

  return <ApprovalContext value={value}>{children}</ApprovalContext>;
}

export function ApprovalControls({ id, tone }: { id: string; tone: "dark" | "light" }) {
  const { status, decide, savingId, errorId } = useApproval();
  const current = status(id);
  const saving = savingId === id;

  return (
    <div className={`approval-controls approval-controls-${tone}`} role="group" aria-label={`Approval for ${id}`} data-decision={current}>
      <button
        type="button"
        className="approval-approve"
        aria-pressed={current === "approved"}
        disabled={saving}
        onClick={() => decide(id, "approved")}
      >
        Approve
      </button>
      <button
        type="button"
        className="approval-hold"
        aria-pressed={current === "not-approved"}
        disabled={saving}
        onClick={() => decide(id, "not-approved")}
      >
        Not approved
      </button>
      {errorId === id ? (
        <p className="approval-error" role="alert">
          Could not save. Try again.
        </p>
      ) : null}
    </div>
  );
}

export function LibraryBoard({
  posts,
  total,
  channel,
  library,
}: {
  posts: SocialPreviewPost[];
  total: number;
  channel: SocialPreviewChannel;
  library: LibraryQuery;
}) {
  const { status } = useApproval();
  const visible = posts.filter((post) => library.approval === "all" || status(post.id) === library.approval);
  const ready = visible.filter((post) => postIsReady(post)).length;
  const approved = visible.filter((post) => status(post.id) === "approved").length;

  return (
    <>
      <p className="library-count">
        {visible.length} of {total} · {ready} ready · {approved} approved
      </p>
      {visible.length === 0 ? (
        <p className="library-empty">No assets match these filters.</p>
      ) : (
        <ul className="library-grid">
          {visible.map((post) => (
            <li key={post.id}>
              <a className="library-card" href={socialPreviewHref({ post: post.id, channel, library })}>
                <Thumb post={post} />
                <span className="library-meta">
                  <span className="library-badges">
                    <span>{post.format}</span>
                    <span>{post.lane === "paid" ? "Ad" : "Feed"}</span>
                    <span>{postIsReady(post) ? "Ready" : "Waiting"}</span>
                    <span className={`approval-badge approval-badge-${status(post.id)}`}>
                      {status(post.id) === "approved"
                        ? "Approved"
                        : status(post.id) === "not-approved"
                          ? "Not approved"
                          : "Pending"}
                    </span>
                    {post.images && post.images.length > 1 ? <span>{post.images.length} slides</span> : null}
                  </span>
                  <strong>{post.label}</strong>
                  <span className="library-line">{post.onScreen}</span>
                </span>
              </a>
              <ApprovalControls id={post.id} tone="light" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Thumb({ post }: { post: SocialPreviewPost }) {
  const src = post.poster ?? post.images?.[0] ?? null;
  if (!src) {
    return (
      <span className="library-thumb library-thumb-waiting">
        <span>{post.onScreen}</span>
      </span>
    );
  }

  return (
    <span className={`library-thumb library-thumb-${post.format}`}>
      <img src={src} alt="" />
    </span>
  );
}
