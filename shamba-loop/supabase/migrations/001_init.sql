create extension if not exists pgcrypto;

create type public.user_role as enum ('farmer', 'processor', 'collector', 'admin');
create type public.waste_type as enum ('Maize stalks', 'Coffee husks', 'Manure', 'Rice husks');
create type public.listing_status as enum ('Available', 'Offer received', 'Pickup scheduled', 'Completed');
create type public.offer_status as enum ('Pending', 'Accepted', 'Declined');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role public.user_role not null,
  phone text,
  county text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles (id) on delete restrict,
  waste_type public.waste_type not null,
  quantity_kg numeric(12, 2) not null check (quantity_kg > 0),
  asking_price_per_kg numeric(12, 2) not null check (asking_price_per_kg > 0),
  location text not null,
  latitude double precision,
  longitude double precision,
  quality_notes text,
  available_at timestamptz,
  status public.listing_status not null default 'Available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  processor_id uuid not null references public.profiles (id) on delete restrict,
  quantity_kg numeric(12, 2) not null check (quantity_kg > 0),
  price_per_kg numeric(12, 2) not null check (price_per_kg > 0),
  pickup_at timestamptz,
  message text,
  status public.offer_status not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_created_at_idx on public.listings (status, created_at desc);
create index listings_farmer_id_idx on public.listings (farmer_id);
create index offers_listing_id_status_idx on public.offers (listing_id, status);
create index offers_processor_id_idx on public.offers (processor_id);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.offers enable row level security;

-- Add role-aware policies before connecting client or server code to these tables.
