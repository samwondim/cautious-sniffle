-- Content defaults for the contact page and the transfer-notice form.
--
-- Every statement only rewrites a value that still holds the old seeded
-- default. Anything the organisation has edited in the admin is left alone,
-- and running this against a database that never had the old values is a
-- no-op. New keys need no rows: the site falls back to the defaults in
-- `src/lib/content.ts` until someone saves them in the admin.

-- "Contact Us" used to jump to the footer; it now opens /contact.
UPDATE "site_settings"
SET "value" = '/contact', "updated_at" = now()
WHERE "key" = 'hero.primaryHref' AND "value" IN ('#contact', '/#contact');
--> statement-breakpoint

-- The old title named a card-payment form that was never on the page.
UPDATE "site_settings"
SET "value" = 'Sent a transfer? Let us know.', "updated_at" = now()
WHERE "key" = 'donate.formTitle' AND "value" = 'Make a Gift';
--> statement-breakpoint

-- The old copy promised payment processing and cancellable monthly gifts,
-- neither of which the site offers: giving is by bank transfer.
UPDATE "site_settings"
SET "value" = 'Every transfer goes straight into Empower Humanity''s own registered accounts — no platform or intermediary takes a cut. Tell us when you''ve sent a gift and we''ll confirm it has arrived and email your receipt. Monthly gifts are a standing order with your own bank, so you can change or stop one at any time.',
    "updated_at" = now()
WHERE "key" = 'donate.secureBody'
  AND "value" = 'Payments are processed securely. Empower Humanity is a registered nonprofit; gifts may be tax-deductible. Cancel a monthly gift anytime.';
--> statement-breakpoint

-- Placeholder social links rendered as icons that went nowhere. Empty now
-- means "hide this icon".
UPDATE "site_settings"
SET "value" = '', "updated_at" = now()
WHERE "key" IN ('social.websiteHref', 'social.communityHref')
  AND "value" IN ('#', '#contact', '/#contact');
