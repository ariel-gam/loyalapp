-- Add trial_ends_at column to stores table
alter table stores add column if not exists trial_ends_at timestamp with time zone default (now() + interval '7 days');

-- Update existing stores to have a 7-day trial starting now (so they don't get locked out immediately if we enforce it)
update stores set trial_ends_at = (now() + interval '7 days') where trial_ends_at is null;
