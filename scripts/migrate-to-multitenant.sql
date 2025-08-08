-- Migration script to transform single-tenant CornexConnect to multi-tenant SaaS
-- This script handles existing data migration safely

BEGIN;

-- Step 1: Create companies table
CREATE TABLE IF NOT EXISTS "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"industry" text DEFAULT 'manufacturing',
	"country" text DEFAULT 'South Africa' NOT NULL,
	"currency" text DEFAULT 'ZAR' NOT NULL,
	"timezone" text DEFAULT 'Africa/Johannesburg',
	"subscription_tier" text DEFAULT 'starter' NOT NULL,
	"subscription_status" text DEFAULT 'trial' NOT NULL,
	"max_users" integer DEFAULT 5,
	"max_products" integer DEFAULT 100,
	"max_stores" integer DEFAULT 1000,
	"billing_email" text,
	"contact_person" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);

-- Step 2: Insert default company for existing data
INSERT INTO companies (
  name, display_name, slug, contact_person, 
  subscription_tier, subscription_status, max_users, max_products, max_stores,
  industry, country, currency
) VALUES (
  'Cornex Manufacturing',
  'Cornex™ Building Materials', 
  'cornex-default',
  'System Administrator',
  'enterprise',
  'active',
  100,
  1000,
  10000,
  'manufacturing',
  'South Africa',
  'ZAR'
) ON CONFLICT (slug) DO NOTHING;

-- Get the default company ID
-- Step 3: Add company_id columns as nullable first, then populate and make NOT NULL

-- Users table
ALTER TABLE "users" ADD COLUMN "company_id" varchar;
UPDATE "users" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "users" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Products table
ALTER TABLE "products" ADD COLUMN "company_id" varchar;
UPDATE "products" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "products" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_unique";

-- Inventory table  
ALTER TABLE "inventory" ADD COLUMN "company_id" varchar;
UPDATE "inventory" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "inventory" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Distributors table
ALTER TABLE "distributors" ADD COLUMN "company_id" varchar;
UPDATE "distributors" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "distributors" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "distributors" ADD CONSTRAINT "distributors_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Orders table
ALTER TABLE "orders" ADD COLUMN "company_id" varchar;
UPDATE "orders" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_order_number_unique";

-- Order Items table
ALTER TABLE "order_items" ADD COLUMN "company_id" varchar;
UPDATE "order_items" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "order_items" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add remaining tables...
-- Production Schedule
ALTER TABLE "production_schedule" ADD COLUMN "company_id" varchar;
UPDATE "production_schedule" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "production_schedule" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "production_schedule" ADD CONSTRAINT "production_schedule_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Demand Forecast
ALTER TABLE "demand_forecast" ADD COLUMN "company_id" varchar;
UPDATE "demand_forecast" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "demand_forecast" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Sales Metrics
ALTER TABLE "sales_metrics" ADD COLUMN "company_id" varchar;
UPDATE "sales_metrics" SET "company_id" = (SELECT id FROM companies WHERE slug = 'cornex-default' LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "sales_metrics" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "sales_metrics" ADD CONSTRAINT "sales_metrics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_products_company" ON "products" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_company" ON "inventory" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_distributors_company" ON "distributors" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_orders_company" ON "orders" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_company" ON "order_items" ("company_id");

COMMIT;