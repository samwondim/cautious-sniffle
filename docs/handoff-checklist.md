# Empower Humanity — Handoff Checklist

Status as of 13 November 2026. The code work below is done and verified on a
copy of production. What remains are things only the team or the client can
do: credentials, real content and a sending domain.

---

## 1. Blockers — do before the client sees the site

| # | Item | Who | How |
|---|------|-----|-----|
| 1 | **Change the production admin password.** The live admin still accepts the development seed password, which is published in `.env.example`. Anyone who reads the repository can sign in. | Samuel | Sign in at `/admin`, change the password (or reset it directly in the database), and give the client their own account. |
| 2 | **Real bank account numbers.** All seven accounts on `/donate` are placeholders (`1000 0000 0000 01`, …). | Client finance team → admin | Admin → Bank accounts. Then clear *Site content → Donate page → placeholder notice* to remove the yellow warning banner. |
| 3 | **Real contact details.** Phone is a fictional `+1 555` number; email and address are stand-ins. | Client → admin | Admin → Site content → Contact & social. |
| 4 | **Apply the new database migrations to production.** | Samuel | After deploying, run `npm run db:migrate` with production `DATABASE_URL`. 0007 and 0008 only rewrite values still at their old defaults; nothing the client edited is touched. 0009 makes admin emails unique; it fails if two admins share an email, so remove any duplicate first. |

## 2. Content the client needs to supply

- **Photography.** The hero collage, mission portrait, giving photo, volunteer
  backdrop, three of the four projects and two of the three gallery images use
  bundled stand-in photos from `public/placeholders` (Pexels-licensed; sources
  listed in that folder's README). Upload real photos in Admin → Media, then
  set them in Site content and on each project.
- **Projects, impact stats and sector copy** are seeded examples. The project
  locations ("Rift Valley District", "Coastal Region") don't match an
  Ethiopian organisation, and the impact figures (12,400+ etc.) are invented.
- **Organisation tagline** (Site content → Organization) is empty in
  production, so the footer has no tagline and some pages have no search
  description.
- **Tax status.** The Donate page used to say gifts "may be tax-deductible".
  That claim is removed. If it is true in a donor's jurisdiction, the client
  can add it back in Site content → Donate page.

## 3. Turn on staff email alerts (Resend)

New volunteers, contact messages and transfer notices are saved to the admin
regardless. Email alerts are optional and off until configured:

1. Create a Resend account and verify the organisation's sending domain
   (DNS records at their registrar).
2. Create an API key with *Sending access* only.
3. In Vercel → Project → Settings → Environment Variables (Production), set:
   - `RESEND_API_KEY`
   - `NOTIFY_EMAIL_FROM` — e.g. `Empower Humanity <notifications@their-domain>`
   - `NOTIFY_EMAIL_TO` — comma-separated staff inboxes
4. Redeploy, submit the contact form once, and confirm the email arrives.

Each alert sets Reply-To to the person who submitted, so staff can answer
straight from their inbox.

Once a custom domain is live, also set `NEXT_PUBLIC_SITE_URL` so share cards
and the sitemap use it.

## 4. What changed in this pass

**New for visitors**
- `/contact` page with a form; "Contact Us" now opens it instead of
  scrolling to the footer. Messages land in Admin → Messages.
- "Sent a transfer? Let us know" form on `/donate`. Donors report a bank
  transfer (amount, currency, one-off or monthly); it lands in Admin →
  Donations as *Pending* until staff confirm the money arrived.
- Branded 404 and error pages, with the nav kept wherever possible.
- All forms keep what the visitor typed when something needs fixing, move
  focus to the first problem, and confirm success with a clear panel.
- Phones no longer zoom the page when a form field is tapped.
- Empty social icons in the footer are hidden instead of linking nowhere.

**Shareability and search**
- Favicon, Apple touch icon and SVG icon from the logo mark (the old one
  was the Next.js/Vercel template icon).
- Share card for WhatsApp/LinkedIn/X/Facebook in brand colours and fonts;
  project pages share their own photo.
- `robots.txt`, `sitemap.xml` (including every published project), and the
  admin is excluded from search engines.
- Page titles fixed ("What We Do", not "Four sectors, one shared goal.").

**Admin**
- Donation totals are per currency (ETB and USD were being added together
  and shown as dollars), and the overview shows *Transfers to confirm*.
- Status changes no longer appear to revert after saving.
- Readable status labels ("In progress", not `in_progress`), dates on
  donations, and the login button says "Logging in…" rather than "Saving…".

**Engineering**
- Security advisories fixed: Next.js 16.3.6 → 16.4.6 (critical) and Zod
  4.6.7 (high); `npm audit` reports 0 vulnerabilities.
- Removed an unused debug Server Action that wrote junk volunteer rows, and
  the template's leftover SVGs.

## 5. One question for the team

The brand guide reserves orange for "the one action we most want, such as
Donate". The site uses the orange button as the general primary on light
backgrounds (it's documented as deliberate in `globals.css`), so "Send
message" and "Let us know" are orange too. Worth confirming with the client
that this reading of the guide is the one they want.
