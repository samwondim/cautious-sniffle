-- Media moves from external object storage into Postgres.
--
-- Existing `media_assets` rows describe objects in a bucket this application
-- no longer reads, and their bytes do not come with them, so they are cleared
-- rather than left behind as rows that would render as broken images. Content
-- rows referencing one of those object keys fall back to placeholder art,
-- which is exactly what a null `image_url` already means.
UPDATE "projects" SET "image_url" = NULL
  WHERE "image_url" ~ '^uploads/[0-9]{4}/[0-9]{2}/';--> statement-breakpoint
UPDATE "gallery_images" SET "image_url" = NULL
  WHERE "image_url" ~ '^uploads/[0-9]{4}/[0-9]{2}/';--> statement-breakpoint
DELETE FROM "media_assets";--> statement-breakpoint
CREATE TABLE "media_blobs" (
	"media_asset_id" integer PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
DROP INDEX "media_assets_object_key_idx";--> statement-breakpoint
ALTER TABLE "media_blobs" ADD CONSTRAINT "media_blobs_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" DROP COLUMN "object_key";