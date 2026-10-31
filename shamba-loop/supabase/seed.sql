-- Optional local demo rows. Create a farmer profile named "Demo Farmer" first.
insert into public.listings (farmer_id, waste_type, quantity_kg, asking_price_per_kg, location, quality_notes)
select
  profiles.id,
  sample.waste_type::public.waste_type,
  sample.quantity_kg,
  sample.asking_price_per_kg,
  sample.location,
  sample.quality_notes
from public.profiles as profiles
cross join (
  values
    ('Maize stalks', 850::numeric, 8::numeric, 'Nakuru, Rift Valley', 'Dry · bundled'),
    ('Coffee husks', 420::numeric, 12::numeric, 'Njoro, Nakuru', 'Fresh · bagged'),
    ('Manure', 1200::numeric, 5::numeric, 'Bahati, Nakuru', 'Composted · loose')
) as sample(waste_type, quantity_kg, asking_price_per_kg, location, quality_notes)
where profiles.display_name = 'Demo Farmer'
  and profiles.role = 'farmer'
  and not exists (
    select 1
    from public.listings
    where public.listings.farmer_id = profiles.id
      and public.listings.location = sample.location
      and public.listings.waste_type = sample.waste_type::public.waste_type
  );
