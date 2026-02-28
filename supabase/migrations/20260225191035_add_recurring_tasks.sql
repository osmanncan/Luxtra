ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "is_recurring" BOOLEAN DEFAULT false;
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "recurring_months" INTEGER;
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "reminder_days" INTEGER;
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "reminder_date" TEXT;

ALTER TABLE "public"."subscriptions" ADD COLUMN IF NOT EXISTS "reminder_days" INTEGER;
ALTER TABLE "public"."subscriptions" ADD COLUMN IF NOT EXISTS "reminder_date" TEXT;

