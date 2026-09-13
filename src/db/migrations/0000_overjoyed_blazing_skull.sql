CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100) NOT NULL,
	"flag" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_id" integer NOT NULL,
	"translation_language_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_id" integer NOT NULL,
	"word" text NOT NULL,
	"meaning" text NOT NULL,
	"pronunciation" text,
	"part_of_speech" varchar(50),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"recognition_score" integer DEFAULT 0 NOT NULL,
	"recall_score" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"wrong_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"next_review_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_examples" (
	"id" serial PRIMARY KEY NOT NULL,
	"vocabulary_id" integer NOT NULL,
	"sentence" text NOT NULL,
	"translation" text,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"vocabulary_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"review_type" varchar(20) NOT NULL,
	"is_correct" boolean NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_tags" (
	"vocabulary_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "vocabulary_tags_vocabulary_id_tag_id_pk" PRIMARY KEY("vocabulary_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_translation_language_id_languages_id_fk" FOREIGN KEY ("translation_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_reviews" ADD CONSTRAINT "vocabulary_reviews_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_tags" ADD CONSTRAINT "vocabulary_tags_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_tags" ADD CONSTRAINT "vocabulary_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique_idx" ON "tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "user_language_unique_idx" ON "user_languages" USING btree ("user_id","language_id");--> statement-breakpoint
CREATE INDEX "user_languages_user_id_idx" ON "user_languages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vocabulary_user_lang_idx" ON "vocabulary" USING btree ("user_id","language_id");--> statement-breakpoint
CREATE INDEX "vocabulary_user_status_idx" ON "vocabulary" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "vocabulary_user_next_review_idx" ON "vocabulary" USING btree ("user_id","next_review_at");--> statement-breakpoint
CREATE INDEX "vocabulary_user_created_at_idx" ON "vocabulary" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "reviews_vocab_reviewed_at_idx" ON "vocabulary_reviews" USING btree ("vocabulary_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "vocabulary_reviews" USING btree ("user_id");