CREATE TABLE "gallery_images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(200) NOT NULL,
	"caption" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "gallery_images_sort_order_idx" ON "gallery_images" USING btree ("sort_order");