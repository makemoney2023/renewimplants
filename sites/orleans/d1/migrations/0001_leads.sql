CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  form_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  fields TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'closed'))
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
