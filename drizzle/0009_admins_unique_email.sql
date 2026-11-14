-- Admin emails become unique. Sign-in looks an admin up by email, and the new
-- "Add user" form relies on the database to reject a duplicate that slips past
-- its own check (two submissions racing). The old index was a plain one, so
-- nothing stopped two rows sharing an address. The table is hand-managed and
-- tiny; if this fails on a database holding duplicates, remove them first.
DROP INDEX "admins_email_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
