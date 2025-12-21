-- Add is_available column to products
alter table products add column if not exists is_available boolean default true;
