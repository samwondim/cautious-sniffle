CREATE TYPE "public"."bank_scope" AS ENUM('local', 'international');--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bank_accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"scope" "bank_scope" NOT NULL,
	"bank_name" varchar(160) NOT NULL,
	"account_name" varchar(160) NOT NULL,
	"account_number" varchar(64) NOT NULL,
	"swift_code" varchar(11),
	"branch" varchar(120),
	"currency" varchar(3) DEFAULT 'ETB' NOT NULL,
	"note" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bank_accounts_scope_idx" ON "bank_accounts" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "bank_accounts_status_idx" ON "bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bank_accounts_sort_order_idx" ON "bank_accounts" USING btree ("sort_order");