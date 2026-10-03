CREATE TYPE "public"."donation_frequency" AS ENUM('one_time', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('pending', 'completed', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'in_progress', 'archived');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "donations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"frequency" "donation_frequency" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"donor_name" varchar(120) NOT NULL,
	"donor_email" varchar(255) NOT NULL,
	"message" text,
	"status" "donation_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giving_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "giving_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(40) DEFAULT 'heart' NOT NULL,
	"cta_label" varchar(60) NOT NULL,
	"cta_href" varchar(200) DEFAULT '/donate' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_stats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "impact_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"value" varchar(40) NOT NULL,
	"label" varchar(120) NOT NULL,
	"detail" varchar(160) NOT NULL,
	"icon" varchar(40) DEFAULT 'plus-circle' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(200) NOT NULL,
	"location" varchar(120) NOT NULL,
	"sector_id" integer,
	"summary" text NOT NULL,
	"body" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sectors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(40) DEFAULT 'plus-circle' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(120) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme" (
	"id" integer PRIMARY KEY NOT NULL,
	"accent" varchar(7) DEFAULT '#2E6153' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "volunteers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"interest" varchar(80) NOT NULL,
	"message" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admins_email_idx" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "giving_options_sort_order_idx" ON "giving_options" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "impact_stats_sort_order_idx" ON "impact_stats" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_status_idx" ON "messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_sector_id_idx" ON "projects" USING btree ("sector_id");--> statement-breakpoint
CREATE INDEX "projects_sort_order_idx" ON "projects" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "sectors_sort_order_idx" ON "sectors" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "sessions_admin_id_idx" ON "sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "volunteers_created_at_idx" ON "volunteers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "volunteers_status_idx" ON "volunteers" USING btree ("status");