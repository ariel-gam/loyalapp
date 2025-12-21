-- DATA MIGRATION FOR SAAS (MULTI-TENANT) ARCHITECTURE

-- 1. Create 'stores' table
create table if not exists stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users not null,
  slug text unique not null,
  name text not null,
  settings jsonb default '{}'::jsonb, -- Stores color, logo, phone, address
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add 'store_id' to existing tables
-- We use "do $$" block to avoid errors if columns already exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'store_id') then
        alter table products add column store_id uuid references stores(id) on delete cascade;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'store_id') then
        alter table orders add column store_id uuid references stores(id) on delete cascade;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'customers' and column_name = 'store_id') then
        alter table customers add column store_id uuid references stores(id) on delete cascade;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'discounts' and column_name = 'store_id') then
        alter table discounts add column store_id uuid references stores(id) on delete cascade;
    end if;
end $$;

-- 2.1 Update Constraints (Per-store Uniqueness)
-- Allow same phone number in different stores
alter table customers drop constraint if exists customers_phone_key;
-- Create new composite unique key if not exists (using do block to avoid error if exists)
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'customers_phone_store_key') then
        alter table customers add constraint customers_phone_store_key unique (phone, store_id);
    end if;
end $$;


-- 3. Create indexes for performance
create index if not exists idx_products_store on products(store_id);
create index if not exists idx_orders_store on orders(store_id);
create index if not exists idx_customers_store on customers(store_id);

-- 4. Enable RLS on 'stores'
alter table stores enable row level security;

-- Policies for Stores
-- Store owners can view/update their own store
create policy "Owners can view their own store"
  on stores for select
  using ( auth.uid() = owner_id );

create policy "Owners can update their own store"
  on stores for update
  using ( auth.uid() = owner_id );

-- Insert policy (for setup page)
create policy "Users can create their first store"
  on stores for insert
  with check ( auth.uid() = owner_id );

-- Public read access for stores (to load settings on public page)
create policy "Public can view stores"
  on stores for select
  using ( true );

-- 5. UPDATE RLS for other tables
-- We need to drop old policies or update them. For simplicity, we create new "SaaS" policies.
-- Ideally we would drop specific named policies, but we'll try to just add these.

-- Products: Public can view (filtered by store in query), Owner can CRUD
create policy "SaaS Public View Products"
  on products for select
  using ( true );

create policy "SaaS Owner Manage Products"
  on products for all
  using ( exists (select 1 from stores where stores.id = products.store_id and stores.owner_id = auth.uid()) );

-- Orders: Owner can CRUD, Public can Insert (Cart)
create policy "SaaS Owner Manage Orders"
  on orders for all
  using ( exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid()) );

create policy "SaaS Public Insert Orders"
  on orders for insert
  with check ( true ); 

-- Customers: Owner can CRUD
create policy "SaaS Owner Manage Customers"
  on customers for all
  using ( exists (select 1 from stores where stores.id = customers.store_id and stores.owner_id = auth.uid()) );

create policy "SaaS Public Insert Customers"
  on customers for insert
  with check ( true );

-- Discounts: Owner can CRUD, Public View
create policy "SaaS Owner Manage Discounts"
  on discounts for all
  using ( exists (select 1 from stores where stores.id = discounts.store_id and stores.owner_id = auth.uid()) );

create policy "SaaS Public View Discounts"
  on discounts for select
  using ( true );

