-- Human approval for social catalog units.
-- Written only by the Next.js route /api/social-approvals with the service-role key.
-- RLS is on with no policies, so anon and authenticated clients can neither read nor write.
-- A scheduler reads approved rows. This table does not post to Meta.
begin;

create table if not exists public.social_approvals (
    unit_id     text primary key,
    decision    text not null check (decision in ('approved', 'not-approved')),
    decided_at  timestamptz not null default now()
);

comment on table public.social_approvals is
    'Approve or not-approved decisions for social catalog units. Absence means pending. Service role only.';

alter table public.social_approvals enable row level security;

commit;
