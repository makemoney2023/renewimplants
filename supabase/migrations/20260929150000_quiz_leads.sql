-- Implant candidate quiz leads (spec: docs/specs/2026-09-29-seo-blog-lead-quiz-spec.md §9).
-- Written only by the Next.js route /api/quiz-leads with the service-role key.
-- RLS is on with no policies, so anon/authenticated clients can neither read nor write.
begin;

create table if not exists public.quiz_leads (
    id                 uuid primary key default gen_random_uuid(),
    created_at         timestamptz not null default now(),
    first_name         text not null,
    email              text not null,
    phone              text not null,
    preferred_contact  text not null check (preferred_contact in ('call', 'text', 'email')),
    best_time          text,
    answers            jsonb not null,
    answers_version    text not null,
    result_path        text not null check (result_path in ('full-arch', 'denture-alternative', 'failed-work', 'individual')),
    modifiers          text[] not null default '{}',
    lead_score         integer not null,
    lead_tier          text not null check (lead_tier in ('hot', 'warm', 'nurture')),
    marketing_consent  boolean not null default false,
    consent_text       text,
    consent_at         timestamptz,
    landing_path       text,
    referrer           text,
    utm_source         text,
    utm_medium         text,
    utm_campaign       text,
    utm_term           text,
    utm_content        text,
    status             text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
    contacted_at       timestamptz
);

comment on table public.quiz_leads is
    'Implant candidate quiz submissions. Contains personal health information (PHIPA): minimum necessary access only.';

alter table public.quiz_leads enable row level security;

create index if not exists quiz_leads_created_at_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_status_tier_idx on public.quiz_leads (status, lead_tier);

commit;
