# Empower Humanity

The public website and content admin for Empower Humanity: a Next.js 16 app
with a Postgres database (Neon in production), deployed on Vercel.

- **Public site**: home, Mission & Vision, What We Do, Our Work (with a page
  per project), Gallery, Donate (bank transfer), Contact, Privacy, Cookies.
- **Admin** at `/admin`: every word and image on the site, projects, impact
  stats, bank accounts, a media library, and inboxes for volunteers,
  messages and reported transfers.

## Local development

Requirements: Node 20+, and either a local Postgres or a Neon branch.

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run db:setup             # create the database, migrate, seed sample content
npm run dev                  # http://localhost:3000, admin at /admin
```

The seed creates an admin account from `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD`. Those defaults are for local development only. Never
use them on a deployed database.

Point local development at a Neon **branch**, not at production: form
submissions and admin edits write to whatever `DATABASE_URL` names.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route types + TypeScript |
| `npm run db:generate` | New migration from `src/db/schema.ts` changes |
| `npm run db:migrate` | Apply migrations in `drizzle/` to `DATABASE_URL` |
| `npm run db:seed` | Seed sample content and the admin account |
| `npm run db:reset` | Drop and recreate the local database |
| `npm run db:studio` | Drizzle Studio |

## Deploying

CI (`.github/workflows/ci.yml`) runs lint, typecheck and build on every push.
Vercel's GitHub integration deploys every push to `main` to production and
every other branch to a preview URL. There is no deploy workflow in GitHub
Actions; adding one would deploy each commit twice.

**Migrations are not run by the deploy.** After deploying a change that adds
a file to `drizzle/`, run `npm run db:migrate` with the production
`DATABASE_URL`.

## Environment variables

See `.env.example` for the full list with notes. Optional extras:

- `NEXT_PUBLIC_SITE_URL`: the public origin, for share cards, the sitemap and
  links in emails. On Vercel it defaults to the production domain.
- `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO`: staff email
  alerts for new volunteers, messages and transfer notices. Alerts are off
  when these are unset, and submissions still land in the admin.

## Where things live

| Path | Contents |
|---|---|
| `src/app/(site)` | Public pages |
| `src/app/(admin)` | Admin (all of it `noindex`) |
| `src/app/actions` | Server Actions: `public.ts` (forms), `admin.ts`, `media.ts` |
| `src/lib/content.ts` | Content defaults and queries; every editable key starts here |
| `src/lib/notify.ts` | Staff email alerts |
| `src/db/schema.ts` | Database schema |
| `src/assets/fonts` | Static brand font cuts used by the share image |
| `docs/` | Handoff notes |
