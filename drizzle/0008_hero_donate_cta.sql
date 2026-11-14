-- Home page hero: Donate becomes the primary action, and the eyebrow becomes
-- an identity line saying who the organisation is and where it works.
--
-- Every statement only rewrites a value that still holds an old default.
-- Anything the organisation has edited in the admin is left alone, and
-- running this against a database that never had the old values is a no-op.
-- `hero.backdropImage` is no longer read anywhere; its row, if any, is left
-- in place and is harmless.

-- The primary button was "Contact Us", the lowest-intent action on the page.
-- Contact stays reachable from the nav and the footer.
UPDATE "site_settings"
SET "value" = 'Donate', "updated_at" = now()
WHERE "key" = 'hero.primaryLabel' AND "value" = 'Contact Us';
--> statement-breakpoint

UPDATE "site_settings"
SET "value" = '/donate', "updated_at" = now()
WHERE "key" = 'hero.primaryHref' AND "value" IN ('/contact', '#contact', '/#contact');
--> statement-breakpoint

-- Both earlier defaults: the original seed, which recited the four sectors
-- the subtitle then repeated, and the empty value that replaced it, which
-- left nothing on the first screen naming the organisation or the country.
UPDATE "site_settings"
SET "value" = 'Empower Humanity · Community-led programs across Ethiopia',
    "updated_at" = now()
WHERE "key" = 'hero.eyebrow'
  -- Only the original seed string. An empty value is deliberately not
  -- matched: it can't be told apart from an eyebrow someone cleared on
  -- purpose in the admin.
  AND "value" = 'Join our mission across health, education, livelihoods, and the environment.';
