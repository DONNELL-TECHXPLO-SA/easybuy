# Production Readiness Checklist

This checklist covers the storefront only and excludes the payment gateway, which will be added later.

## Must Fix Before Production

- [x] Disable or lock down the admin bootstrap endpoint in `admin/src/app/api/auth/setup/route.ts`.
- [x] Remove any real secrets from the repo and ensure only template env files are committed.
- Rotate any exposed API keys or service role keys.
- Review Supabase RLS policies for all user, order, cart, wishlist, profile, and admin tables.
- Add strict authorization checks for all protected API routes and admin actions.
- Add Content Security Policy and security headers in middleware.
- Ensure session cookies are `HttpOnly`, `Secure`, and `SameSite`.
- Add rate limiting or abuse protection for public endpoints such as auth and contact forms.
- Confirm there are no public endpoints that leak users, orders, or admin data.

## Should Fix Soon

- Turn on TypeScript strict mode and fix the type issues it reveals.
- Add automated linting, type checking, and build checks in CI.
- Add unit tests for core utilities and API handlers.
- Add end-to-end tests for signup, login, cart, wishlist, profile, and order flows.
- Add structured logging and error monitoring.
- Add health checks and a deployment readiness check.
- Review image delivery, caching, and static asset optimization.
- Add accessibility checks for forms, navigation, and interactive components.
- Improve metadata, sitemap, robots.txt, and social sharing tags.

## Nice to Have

- Add dependency update automation such as Dependabot or Renovate.
- Add bundle analysis and remove unused dependencies.
- Add analytics and product usage tracking.
- Add feature flags for gradual rollouts.
- Add a backup and restore runbook for the database.
- Add a clear incident response and support process.
- Add performance budgets for key pages.
- Add localization support if the store will serve multiple regions.

## Notes

- The current codebase is close to a usable launch candidate, but it is not production-ready yet.
- The biggest launch blocker is the admin setup flow, followed by auth and data-access hardening.
- Payment gateway work can be added later after these safety and reliability items are addressed.
