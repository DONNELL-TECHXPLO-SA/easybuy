# Deployment Runbook

This runbook covers the storefront and admin apps. The payment gateway is intentionally excluded for now.

## Before Release

- Verify `ALLOW_ADMIN_SETUP=false` in production.
- Confirm all secrets are stored in the deployment platform, not committed to the repo.
- Rotate Supabase and EmailJS keys if they were ever exposed.
- Run CI and confirm lint, type check, and build succeed for both apps.
- Review Supabase RLS and authorization rules for user-facing tables and admin actions.

## Release Steps

1. Deploy the storefront from the repository root.
2. Deploy the admin app from the `admin` folder.
3. Confirm both apps have the correct environment variables.
4. Confirm the public storefront loads product pages, cart, wishlist, account, and contact pages.
5. Confirm admin login works and setup endpoints remain disabled.

## Post-Release Checks

- Verify error monitoring is receiving events.
- Check that auth sessions persist correctly across page loads.
- Validate a few critical customer flows manually.
- Create a sample order and verify shipping method, shipping cost, and ETA match the persisted order snapshot in customer and admin emails.
- Confirm checkout refuses order submission until shipping rates are calculated and a valid destination is present.
- Review logs for unexpected 4xx or 5xx spikes.

## Rollback

- Revert to the previous deployment if a release breaks authentication, browsing, or admin access.
- Keep the last known-good environment variables ready for redeploy.
