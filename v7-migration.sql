-- Chill Out Cafe V7 database migration
-- Run this ONCE in Supabase SQL Editor after uploading the V7 website files.
alter table public.menu_items add column if not exists original_price numeric(10,2) check(original_price is null or original_price>=0);
alter table public.menu_items add column if not exists offer_price numeric(10,2) check(offer_price is null or offer_price>=0);
update public.menu_items set original_price=coalesce(original_price,price), offer_price=coalesce(offer_price,price) where original_price is null or offer_price is null;
alter table public.site_settings add column if not exists instagram_url text not null default 'https://www.instagram.com/chill0ut_gannavram?stkn=cWtwdDl1azV5ZDR5';
update public.site_settings set instagram_url='https://www.instagram.com/chill0ut_gannavram?stkn=cWtwdDl1azV5ZDR5' where id=1;
