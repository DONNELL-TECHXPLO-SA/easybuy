# Free eCommerce Template for Next.js - EasyBuy

The free Next.js eCommerce template is a lite version of the EasyBuy Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![EasyBuy](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)

While EasyBuy Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### EasyBuy Free VS EasyBuy Pro

| ✨ Features                   | 🎁 EasyBuy Free | 🔥 EasyBuy Pro               |
| ----------------------------- | --------------- | ---------------------------- |
| Next.js Pages                 | Static          | Dynamic Boilerplate Template |
| Components                    | Limited         | All According to Demo        |
| eCommerce Functionality       | Included        | Included                     |
| Integrations (DB, Auth, etc.) | Not Included    | Included                     |
| Community Support             | Included        | Included                     |
| Premium Email Support         | Not Included    | Included                     |
| Lifetime Free Updates         | Included        | Included                     |

#### [🚀 Live Demo](https://demo.easybuy.com/)

#### [🌐 Visit Website](https://easybuy.com/)

## Vercel Deployment

This repo contains two separate Next.js apps:

- Storefront: repo root (`/`)
- Admin: `admin/`

Deploy them as two separate Vercel projects from the same Git repository. In each Vercel project, set the correct root directory before the first deploy:

- Storefront project root: `.`
- Admin project root: `admin`

Use the same Supabase project for both apps if you want shared users, products, orders, and auth sessions. If you want full isolation, create a second Supabase project and point the admin app at that instead.

Required environment variables for both deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recommended server-only variable when the app needs admin/server access:

- `SUPABASE_SERVICE_ROLE_KEY`

Also add both deployed Vercel domains to your Supabase auth settings so sign-in redirects and session cookies work correctly.

Example local env files are included in the repo as `.env.example` and `admin/.env.example`.

## Update Logs

Version 0.1.2 - [Mar 16, 2026]

- Update Next.js, React, and React DOM dependencies, add baseline-browser-mapping
