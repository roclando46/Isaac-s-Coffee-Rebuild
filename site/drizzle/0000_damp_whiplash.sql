CREATE TABLE "checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"gift_card_id" uuid,
	"gift_card_applied" integer DEFAULT 0 NOT NULL,
	"stripe_session_id" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"initial_amount" integer NOT NULL,
	"balance" integer NOT NULL,
	"purchaser_email" text NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"message" text,
	"send_on" date NOT NULL,
	"sent_at" timestamp with time zone,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_cards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "opt_outs" (
	"email" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 2001 CACHE 1),
	"kind" text NOT NULL,
	"stripe_session_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"email" text NOT NULL,
	"name" text,
	"items" jsonb NOT NULL,
	"delivery" text,
	"address" jsonb,
	"amount_total" integer NOT NULL,
	"amount_discount" integer DEFAULT 0 NOT NULL,
	"has_one_off_coffee" boolean DEFAULT false NOT NULL,
	"pickup_at" text,
	"status" text DEFAULT 'paid' NOT NULL,
	"reorder_reminder_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_slug" text NOT NULL,
	"shipment_id" uuid,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"source" text NOT NULL,
	"stripe_invoice_id" text,
	"email" text NOT NULL,
	"name" text,
	"address" jsonb,
	"delivery" text NOT NULL,
	"items" jsonb NOT NULL,
	"gift_message" text,
	"due_on" date NOT NULL,
	"status" text DEFAULT 'due' NOT NULL,
	"tracking_number" text,
	"dispatched_at" timestamp with time zone,
	"review_request_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"email" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"source" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
