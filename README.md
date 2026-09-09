# Chill Out Cafe — V9

This package adds the uploaded FROUNT PG menu as editable menu items and keeps the V8 no-loyalty customer-facing website.

## Owner menu controls
The owner has full menu rights: add, edit, enable/disable, delete, change item name/category/description, upload/change photo, and edit original and selling/offer prices.

Run `v9-menu-migration.sql` once in Supabase SQL Editor after deploying the website files.

Customer menu URL:
https://editorgaadu-cloud.github.io/chill-out-cafe/


## Backend
Live Supabase Edge Function: `manage-staff-v2` V15 (JWT verification enabled). The source is included in `manage-staff-v2/index.ts`.
