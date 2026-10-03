ALTER TABLE "theme" ALTER COLUMN "accent" SET DEFAULT '#3EACB4';--> statement-breakpoint
UPDATE "theme" SET "accent" = '#3EACB4' WHERE "accent" = '#2E6153';