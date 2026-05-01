CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "poll_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" text NOT NULL,
	"voter_hash" text,
	"event_type" text NOT NULL,
	"ip_hash" text,
	"user_agent_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" text NOT NULL,
	"voter_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"poll_id" text NOT NULL,
	"option_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_response_id_poll_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."poll_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "poll_activity_logs_poll_id_idx" ON "poll_activity_logs" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "poll_activity_logs_event_type_idx" ON "poll_activity_logs" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_responses_poll_voter_unique" ON "poll_responses" USING btree ("poll_id","voter_hash");--> statement-breakpoint
CREATE INDEX "poll_responses_poll_id_idx" ON "poll_responses" USING btree ("poll_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_votes_response_option_unique" ON "poll_votes" USING btree ("response_id","option_key");--> statement-breakpoint
CREATE INDEX "poll_votes_poll_id_idx" ON "poll_votes" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "poll_votes_option_key_idx" ON "poll_votes" USING btree ("option_key");
