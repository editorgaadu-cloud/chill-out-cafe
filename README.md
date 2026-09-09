Chill Out Cafe V8 — public loyalty/rewards sections removed. Owner/staff controls and all other V7 features remain.

# Chill Out Cafe — V8

Free static cafe website connected to Supabase.

## Included
- Public menu; no customer login required.
- QR/table ordering with owner-controlled ON/OFF switch.
- When QR ordering is OFF: “Online ordering is currently unavailable. Please order at the counter.”
- Multiple customer phone numbers with Call to Order buttons.
- Customer loyalty login/points.
- Owner dashboard: overview, menu, offers, orders, sales, loyalty, settings, phone orders, owners/workers.
- All owners have the same Owner Dashboard permissions.
- Primary Owner: Editorgaadu@gmail.com; only Primary Owner can add owners; Primary Owner cannot be removed.
- Workers have a separate kitchen/order dashboard.
- Google Review button uses the cafe’s configured review URL.

## Deployment
Upload the project files to any free static host. Keep `config.js` with the Supabase publishable key only. Never put a Supabase secret/service-role key in frontend files.


## V7 additions
- Menu items support original price and offer/selling price.
- Customers see the original price crossed out when the offer price is lower.
- Owner can add a menu photo from the phone; the browser compresses it before saving.
- Instagram link is shown to customers and can be changed in Owner > Settings.
- Run `v7-migration.sql` once in the Supabase SQL Editor before using the new price fields.
