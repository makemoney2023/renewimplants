-- Implant candidate quiz leads.
-- Written only by POST /api/quiz-leads through the Worker D1 binding.
-- There is no client binding and no public read API.
-- Personal health information (PHIPA): restrict dashboard access to the clinic.

CREATE TABLE IF NOT EXISTS quiz_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('call', 'text', 'email')),
  best_time TEXT,
  answers TEXT NOT NULL,
  answers_version TEXT NOT NULL,
  result_path TEXT NOT NULL CHECK (result_path IN ('full-arch', 'denture-alternative', 'failed-work', 'individual')),
  modifiers TEXT NOT NULL DEFAULT '[]',
  lead_score INTEGER NOT NULL,
  lead_tier TEXT NOT NULL CHECK (lead_tier IN ('hot', 'warm', 'nurture')),
  marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK (marketing_consent IN (0, 1)),
  consent_text TEXT,
  consent_at TEXT,
  landing_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'closed')),
  contacted_at TEXT
);

CREATE INDEX IF NOT EXISTS quiz_leads_created_at_idx ON quiz_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_leads_status_tier_idx ON quiz_leads (status, lead_tier);
