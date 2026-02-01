


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id, email, plan, created_at)
  values (
    new.id,
    new.email,
    'free',
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_user_id_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.user_id <> old.user_id then
    raise exception 'user_id cannot be changed';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."prevent_user_id_change"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "month" "text",
    "total_income" numeric DEFAULT 0,
    "total_expense" numeric DEFAULT 0,
    "growth_percent" numeric DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_preferences" (
    "user_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "pending_in" boolean DEFAULT true NOT NULL,
    "pending_out" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "category" "text",
    "date" "date" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "payment_mode" "text",
    "client_email" "text",
    "due_date" "date",
    "last_reminder_sent" timestamp with time zone,
    "reminder_count" integer DEFAULT 0,
    "last_manual_reminder_sent" timestamp with time zone,
    "manual_reminder_sent" boolean DEFAULT false NOT NULL,
    "received_at" timestamp with time zone,
    CONSTRAINT "due_date_required_for_pending" CHECK (((("status" = ANY (ARRAY['pending_in'::"text", 'pending_out'::"text"])) AND ("due_date" IS NOT NULL)) OR ("status" = 'completed'::"text"))),
    CONSTRAINT "entries_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text"]))),
    CONSTRAINT "valid_entry_status" CHECK (("status" = ANY (ARRAY['completed'::"text", 'pending_in'::"text", 'pending_out'::"text"])))
);


ALTER TABLE "public"."entries" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."monthly_entry_totals" AS
 SELECT ("date_trunc"('month'::"text", ("date")::timestamp with time zone))::"date" AS "month",
    "user_id",
    "sum"(
        CASE
            WHEN ("type" = 'income'::"text") THEN "amount"
            ELSE (0)::numeric
        END) AS "total_income",
    "sum"(
        CASE
            WHEN ("type" = 'expense'::"text") THEN "amount"
            ELSE (0)::numeric
        END) AS "total_expense"
   FROM "public"."entries"
  WHERE ("user_id" = "auth"."uid"())
  GROUP BY (("date_trunc"('month'::"text", ("date")::timestamp with time zone))::"date"), "user_id"
  ORDER BY (("date_trunc"('month'::"text", ("date")::timestamp with time zone))::"date");


ALTER VIEW "public"."monthly_entry_totals" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."monthly_growth" AS
 SELECT "month",
    "user_id",
    "total_income",
    "total_expense",
    ("total_income" - "lag"("total_income") OVER (PARTITION BY "user_id" ORDER BY "month")) AS "income_growth",
    ("total_expense" - "lag"("total_expense") OVER (PARTITION BY "user_id" ORDER BY "month")) AS "expense_growth"
   FROM "public"."monthly_entry_totals";


ALTER VIEW "public"."monthly_growth" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'system'::"text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_reminders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payment_reminders_type_check" CHECK (("type" = ANY (ARRAY['pending_out_3d'::"text", 'pending_out_1d'::"text", 'pending_in_overdue'::"text", 'pending_in_repeat'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."payment_reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "avatar" "text",
    "currency" "text" DEFAULT 'USD'::"text",
    "receiving_accounts" "jsonb" DEFAULT '[]'::"jsonb",
    "payment_methods" "jsonb" DEFAULT '[]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "email" "text",
    "email_reminders_enabled" boolean DEFAULT true,
    "reminder_email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "plan" "text" DEFAULT 'free'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_user_plan" CHECK (("plan" = ANY (ARRAY['free'::"text", 'pro'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analytics_cache"
    ADD CONSTRAINT "analytics_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_preferences"
    ADD CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_reminders"
    ADD CONSTRAINT "payment_reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_entries_user_date" ON "public"."entries" USING "btree" ("user_id", "date" DESC);



CREATE INDEX "idx_payment_reminders_entry" ON "public"."payment_reminders" USING "btree" ("entry_id");



CREATE INDEX "idx_payment_reminders_type" ON "public"."payment_reminders" USING "btree" ("type");



CREATE INDEX "idx_payment_reminders_user" ON "public"."payment_reminders" USING "btree" ("user_id");



CREATE UNIQUE INDEX "uniq_entry_reminder_type" ON "public"."payment_reminders" USING "btree" ("entry_id", "type");



CREATE OR REPLACE TRIGGER "trg_prevent_user_id_change" BEFORE UPDATE ON "public"."entries" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_user_id_change"();



ALTER TABLE ONLY "public"."analytics_cache"
    ADD CONSTRAINT "analytics_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_preferences"
    ADD CONSTRAINT "email_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_reminders"
    ADD CONSTRAINT "payment_reminders_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_reminders"
    ADD CONSTRAINT "payment_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow individual insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow individual select" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow individual update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "No direct inserts from client" ON "public"."payment_reminders" FOR INSERT WITH CHECK (false);



CREATE POLICY "Users can delete own entries" ON "public"."entries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own entries" ON "public"."entries" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their email preferences" ON "public"."email_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own entries" ON "public"."entries" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own notifications" ON "public"."notifications" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own analytics" ON "public"."analytics_cache" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own entries" ON "public"."entries" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own profile" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can update own entries" ON "public"."entries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their email preferences" ON "public"."email_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their email preferences" ON "public"."email_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own reminders" ON "public"."payment_reminders" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."analytics_cache" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete own entries" ON "public"."entries" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "delete own notifications" ON "public"."notifications" FOR DELETE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."email_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert own entries" ON "public"."entries" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "insert own notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read own entries" ON "public"."entries" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "read own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "update own entries" ON "public"."entries" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_user_id_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_user_id_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_user_id_change"() TO "service_role";
























GRANT ALL ON TABLE "public"."analytics_cache" TO "anon";
GRANT ALL ON TABLE "public"."analytics_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_cache" TO "service_role";



GRANT ALL ON TABLE "public"."email_preferences" TO "anon";
GRANT ALL ON TABLE "public"."email_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."email_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."entries" TO "anon";
GRANT ALL ON TABLE "public"."entries" TO "authenticated";
GRANT ALL ON TABLE "public"."entries" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_entry_totals" TO "anon";
GRANT ALL ON TABLE "public"."monthly_entry_totals" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_entry_totals" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_growth" TO "anon";
GRANT ALL ON TABLE "public"."monthly_growth" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_growth" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payment_reminders" TO "anon";
GRANT ALL ON TABLE "public"."payment_reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_reminders" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


