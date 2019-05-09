/* eslint-disable max-len */
module.exports = `
  CREATE TABLE IF NOT EXISTS reports (
    id serial PRIMARY KEY,
    body jsonb NOT NULL,
    dump bytea NOT NULL,
    stack text NOT NULL,
    search tsvector,
    closed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  ALTER TABLE reports ADD COLUMN IF NOT EXISTS stack text;
  ALTER TABLE reports DROP COLUMN IF EXISTS open;

  CREATE INDEX IF NOT EXISTS index_reports ON reports USING GIN(body jsonb_path_ops);
  CREATE INDEX IF NOT EXISTS index_reports_search ON reports USING GIN(search);

  CREATE OR REPLACE FUNCTION reports_set_created_at() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.created_at IS NULL THEN
        NEW.created_at = now();
      END IF;
      RETURN NEW;
    END;
  $$ language 'plpgsql';

  CREATE OR REPLACE FUNCTION reports_set_updated_at() RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS set_created_at ON reports;
  CREATE TRIGGER set_created_at BEFORE INSERT ON reports FOR EACH ROW EXECUTE PROCEDURE reports_set_created_at();

  DROP TRIGGER IF EXISTS set_updated_at ON reports;
  CREATE TRIGGER set_updated_at BEFORE INSERT ON reports FOR EACH ROW EXECUTE PROCEDURE reports_set_updated_at();
`;
/* eslint-enable max-len */
