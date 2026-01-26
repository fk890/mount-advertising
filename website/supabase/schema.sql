-- Mount Advertising shop schema for Supabase

-- Extensions
create extension if not exists "pgcrypto";

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text not null,
  subcategory text,
  images text[] not null default '{}',
  stock integer not null default 0,
  is_new boolean default false,
  specifications jsonb,
  collection text,
  article_no text,
  colors text[],
  rating numeric,
  reviews integer,
  in_stock boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- Users (profile table synced from Supabase Auth)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'lastName')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end;
$$;

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null default 1,
  size text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cart_items_unique_idx
  on public.cart_items (user_id, product_id, coalesce(size, ''), coalesce(color, ''));

-- Wishlist items
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_email text not null,
  customer_first_name text,
  customer_last_name text,
  customer_phone text,
  shipping_address text,
  shipping_city text,
  shipping_state text,
  shipping_zip_code text,
  subtotal numeric,
  shipping_fee numeric,
  gift_packaging_fee numeric,
  promo_code text,
  promo_discount numeric,
  total_amount numeric not null,
  payment_method text,
  payment_status text,
  -- PayPal fields
  paypal_order_id text,
  paypal_payer_id text,
  paypal_payment_id text,
  -- Razorpay fields
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  order_status text,
  fulfillment_status text,
  gift_packaging boolean default false,
  gift_note text,
  created_at timestamptz not null default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_sku text,
  unit_price numeric not null,
  quantity integer not null default 1,
  total_price numeric not null,
  size text,
  color text,
  product_collection text,
  product_category text,
  -- Custom order fields
  customization jsonb,
  custom_design_url text,
  created_at timestamptz not null default now()
);

-- Optional: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'products_updated_at') then
    create trigger products_updated_at
      before update on public.products
      for each row execute procedure public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'users_updated_at') then
    create trigger users_updated_at
      before update on public.users
      for each row execute procedure public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'cart_items_updated_at') then
    create trigger cart_items_updated_at
      before update on public.cart_items
      for each row execute procedure public.set_updated_at();
  end if;
end;
$$;
