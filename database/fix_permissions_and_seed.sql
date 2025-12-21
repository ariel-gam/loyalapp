-- 1. Ensure Tables Exist (Idempotent)
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_price numeric not null,
  category_id text not null,
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists discounts (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  day_of_week smallint not null,
  percent integer not null,
  is_active boolean default true,
  unique(product_id, day_of_week)
);

-- 2. DISABLE RLS to ensure public access for this MVP
alter table products disable row level security;
alter table discounts disable row level security;
alter table customers disable row level security;
alter table orders disable row level security;

-- 3. Seed Data (Upsert style logic using ON CONFLICT if possible, or simple insert)
-- Note: ON CONFLICT requires a unique constraint. We added 'name' constraint implicitly in logic before, but here let's validte.
-- Simplified: We just insert if empty.

do $$
begin
  if not exists (select 1 from products where name = 'Pizza Muzzarella') then
    insert into products (name, description, base_price, category_id, is_available, image_url)
    values 
      ('Pizza Muzzarella', 'Salsa de tomate, muzzarella, orégano y aceitunas.', 12000, 'pizzas', true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80'),
      ('Pizza Napolitana', 'Salsa de tomate, muzzarella, rodajas de tomate, ajo y perejil.', 13500, 'pizzas', true, 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80'),
      ('Empanada de Carne', 'Carne cortada a cuchillo, suave y jugosa.', 1500, 'empanadas', true, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80'),
      ('Empanada J y Q', 'Clásica empanada de jamón y queso.', 1500, 'empanadas', true, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80'),
      ('Coca Cola 1.5L', 'Gaseosa sabor cola.', 3500, 'bebidas', true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'),
      ('Cerveza IPA', 'Pinta de cerveza artesanal estilo IPA.', 4500, 'bebidas', true, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80');
  end if;
end $$;

-- 4. Seed Discounts
do $$
declare
  muzza_id uuid;
  ipa_id uuid;
begin
  select id into muzza_id from products where name = 'Pizza Muzzarella';
  select id into ipa_id from products where name = 'Cerveza IPA';

  if muzza_id is not null then
    insert into discounts (product_id, day_of_week, percent) 
    values (muzza_id, 6, 15) -- Saturday
    on conflict (product_id, day_of_week) do nothing;
  end if;

  if ipa_id is not null then
    insert into discounts (product_id, day_of_week, percent) 
    values (ipa_id, 6, 10) 
    on conflict (product_id, day_of_week) do nothing;
  end if;
end $$;
