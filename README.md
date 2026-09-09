# Chill Out Cafe — V3

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
