-- Enable Realtime for the orders table
-- Run this in the Supabase SQL Editor

begin;
  -- Remove if already exists to avoid error (optional, but safe)
  -- alter publication supabase_realtime drop table orders;

  -- Add the table to the publication
  alter publication supabase_realtime add table orders;
commit;

-- Verify
select * from pg_publication_tables where pubname = 'supabase_realtime';
