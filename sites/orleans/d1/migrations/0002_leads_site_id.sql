-- Identifies which clinic stored the lead. Each worker has its own D1 database;
-- the column keeps contact-form and quiz rows explicit if the databases are ever merged.
ALTER TABLE leads ADD COLUMN site_id TEXT NOT NULL DEFAULT '';
