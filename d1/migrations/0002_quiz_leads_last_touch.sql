-- Last-touch content attribution. First-touch columns stay as captured.
-- A later blog visit records the post slug in last_utm_content without
-- overwriting utm_source from the original visit.

ALTER TABLE quiz_leads ADD COLUMN last_landing_path TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_referrer TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_utm_source TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_utm_medium TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_utm_campaign TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_utm_term TEXT;
ALTER TABLE quiz_leads ADD COLUMN last_utm_content TEXT;
