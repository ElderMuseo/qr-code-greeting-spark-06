
-- Enable row level changes for the questions table in Supabase Realtime
ALTER TABLE questions REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
BEGIN;
  -- Check if the publication already exists
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication
      WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;
  
  -- Add the table to the publication if it's not already included
  ALTER PUBLICATION supabase_realtime ADD TABLE questions;
COMMIT;
