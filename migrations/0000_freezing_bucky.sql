CREATE TABLE "admin_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_password" varchar NOT NULL,
	"default_anti_delete_jid" varchar,
	"admin_contact" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"anti_delete_jid" varchar,
	"is_anti_delete_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"phone_number" varchar,
	"whatsapp_name" varchar,
	"status" varchar DEFAULT 'inactive' NOT NULL,
	"session_data" jsonb,
	"pairing_code" varchar,
	"qr_code" text,
	"last_active" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "whatsapp_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "bot_settings" ADD CONSTRAINT "bot_settings_session_id_whatsapp_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."whatsapp_sessions"("session_id") ON DELETE no action ON UPDATE no action;