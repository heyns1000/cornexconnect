import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table for multi-tenant SaaS
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  logo: text("logo"), // URL to company logo
  industry: text("industry").default("manufacturing"), // manufacturing, construction, etc
  country: text("country").notNull().default("South Africa"),
  currency: text("currency").notNull().default("ZAR"),
  timezone: text("timezone").default("Africa/Johannesburg"),
  subscriptionTier: text("subscription_tier").notNull().default("starter"), // starter, professional, enterprise
  subscriptionStatus: text("subscription_status").notNull().default("trial"), // trial, active, suspended, cancelled
  maxUsers: integer("max_users").default(5),
  maxProducts: integer("max_products").default(100),
  maxStores: integer("max_stores").default(1000),
  billingEmail: text("billing_email"),
  contactPerson: text("contact_person").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table for Replit Auth with multi-tenancy
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("viewer"), // admin, manager, distributor, viewer
  region: text("region"),
  currency: text("currency").default("ZAR"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // EPS, BR, LED
  subcategory: text("subcategory"), // Premium, Budget, Ready
  dimensions: text("dimensions"),
  packSize: integer("pack_size"),
  packsPerBox: integer("packs_per_box"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  specifications: jsonb("specifications"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_products_company").on(table.companyId),
  index("idx_products_sku_company").on(table.sku, table.companyId),
]);

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  location: text("location").notNull().default("main_warehouse"),
  currentStock: integer("current_stock").notNull().default(0),
  reservedStock: integer("reserved_stock").notNull().default(0),
  reorderPoint: integer("reorder_point").notNull().default(100),
  maxStock: integer("max_stock").notNull().default(10000),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_inventory_company").on(table.companyId),
]);

export const distributors = pgTable("distributors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, pending
  tier: text("tier").notNull().default("standard"), // premium, standard, basic
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0.00"),
  paymentTerms: text("payment_terms").default("COD"),
  brands: jsonb("brands"), // Array of sub-brands they can sell
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_distributors_company").on(table.companyId),
]);

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  orderNumber: text("order_number").notNull(),
  distributorId: varchar("distributor_id").notNull().references(() => distributors.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, production, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1.000000"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  expectedDelivery: timestamp("expected_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_orders_company").on(table.companyId),
  index("idx_orders_number_company").on(table.orderNumber, table.companyId),
]);

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
}, (table) => [
  index("idx_order_items_company").on(table.companyId),
]);

export const productionSchedule = pgTable("production_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  plannedQuantity: integer("planned_quantity").notNull(),
  actualQuantity: integer("actual_quantity").default(0),
  productionLine: text("production_line").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  priority: text("priority").notNull().default("normal"), // high, normal, low
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_production_company").on(table.companyId),
]);

export const demandForecast = pgTable("demand_forecast", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  region: text("region").notNull(),
  forecastDate: timestamp("forecast_date").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  seasonalFactor: decimal("seasonal_factor", { precision: 5, scale: 2 }),
  marketTrend: text("market_trend"), // up, down, stable
  modelVersion: text("model_version").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_demand_forecast_company").on(table.companyId),
]);

export const salesMetrics = pgTable("sales_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  date: timestamp("date").notNull(),
  region: text("region").notNull(),
  productId: varchar("product_id").references(() => products.id),
  distributorId: varchar("distributor_id").references(() => distributors.id),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  units: integer("units").notNull(),
  currency: text("currency").notNull(),
  metricType: text("metric_type").notNull(), // daily, weekly, monthly
}, (table) => [
  index("idx_sales_metrics_company").on(table.companyId),
]);

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  color: text("color").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_brands_company").on(table.companyId),
  index("idx_brands_name_company").on(table.name, table.companyId),
]);

// Sales Representatives
export const salesReps = pgTable("sales_reps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  empId: text("emp_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  territory: text("territory").notNull(),
  region: text("region").notNull(),
  province: text("province").notNull(),
  targetSales: decimal("target_sales", { precision: 12, scale: 2 }).default("0.00"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sales_reps_company").on(table.companyId),
  index("idx_sales_reps_emp_company").on(table.empId, table.companyId),
]);

// Hardware Stores (8500+ stores)
export const hardwareStores = pgTable("hardware_stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  storeCode: text("store_code").notNull(),
  storeName: text("store_name").notNull(),
  ownerName: text("owner_name"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  storeSize: text("store_size").default("medium"), // small, medium, large, mega
  storeType: text("store_type").notNull(), // independent, chain, franchise
  creditRating: text("credit_rating").default("B"), // A+, A, B+, B, C+, C, D
  monthlyPotential: decimal("monthly_potential", { precision: 10, scale: 2 }).default("0.00"),
  lastOrderDate: timestamp("last_order_date"),
  lastVisitDate: timestamp("last_visit_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_hardware_stores_company").on(table.companyId),
  index("idx_hardware_stores_code_company").on(table.storeCode, table.companyId),
]);

// Route Plans (from Excel sheets)
export const routePlans = pgTable("route_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  routeCode: text("route_code").notNull(),
  routeName: text("route_name").notNull(),
  salesRepId: varchar("sales_rep_id").notNull().references(() => salesReps.id),
  province: text("province").notNull(),
  region: text("region").notNull(),
  visitFrequency: text("visit_frequency").notNull(), // weekly, biweekly, monthly
  totalStores: integer("total_stores").notNull().default(0),
  estimatedDuration: integer("estimated_duration"), // in hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_route_plans_company").on(table.companyId),
  index("idx_route_plans_code_company").on(table.routeCode, table.companyId),
]);

// Route Store Assignments
export const routeStores = pgTable("route_stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  routePlanId: varchar("route_plan_id").notNull().references(() => routePlans.id),
  hardwareStoreId: varchar("hardware_store_id").notNull().references(() => hardwareStores.id),
  visitOrder: integer("visit_order"), // sequence in route
  preferredVisitDay: text("preferred_visit_day"), // monday, tuesday, etc
  estimatedDuration: integer("estimated_duration"), // minutes per visit
  lastVisitDate: timestamp("last_visit_date"),
  nextScheduledVisit: timestamp("next_scheduled_visit"),
  visitNotes: text("visit_notes"),
}, (table) => [
  index("idx_route_stores_company").on(table.companyId),
]);

// AI Suggestions for Smart Ordering
export const aiOrderSuggestions = pgTable("ai_order_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  hardwareStoreId: varchar("hardware_store_id").notNull().references(() => hardwareStores.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  suggestedQuantity: integer("suggested_quantity").notNull(),
  suggestedValue: decimal("suggested_value", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  reasoning: text("reasoning"), // AI explanation for the suggestion
  seasonalFactor: decimal("seasonal_factor", { precision: 5, scale: 2 }),
  urgencyLevel: text("urgency_level").default("normal"), // urgent, high, normal, low
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").default("pending"), // pending, accepted, rejected, expired
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_ai_suggestions_company").on(table.companyId),
]);

// Store Visit Reports
export const storeVisits = pgTable("store_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  hardwareStoreId: varchar("hardware_store_id").notNull().references(() => hardwareStores.id),
  salesRepId: varchar("sales_rep_id").notNull().references(() => salesReps.id),
  visitDate: timestamp("visit_date").notNull(),
  visitType: text("visit_type").notNull(), // scheduled, unscheduled, follow_up
  visitDuration: integer("visit_duration"), // minutes
  ordersPlaced: integer("orders_placed").default(0),
  orderValue: decimal("order_value", { precision: 10, scale: 2 }).default("0.00"),
  storeCondition: text("store_condition"), // excellent, good, fair, poor
  stockLevel: text("stock_level"), // overstocked, well_stocked, low_stock, out_of_stock
  competitorActivity: text("competitor_activity"),
  notes: text("notes"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_store_visits_company").on(table.companyId),
]);

// Factory Setup and Ownership Management
export const factorySetups = pgTable("factory_setups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  factoryName: varchar("factory_name").notNull(),
  location: varchar("location").notNull(),
  ownershipPhase: varchar("ownership_phase").notNull().default("planning"), // 'planning', 'setup', 'installation', 'testing', 'operational', 'owned'
  progressPercentage: integer("progress_percentage").default(0),
  totalInvestment: varchar("total_investment").notNull(),
  currentPayment: integer("current_payment").default(0),
  totalPayments: integer("total_payments").default(3),
  monthlyRevenue: varchar("monthly_revenue").default("0"),
  productionCapacity: integer("production_capacity").default(0), // units per month
  aiOptimizationLevel: integer("ai_optimization_level").default(0), // percentage
  connectedStores: integer("connected_stores").default(0),
  targetStores: integer("target_stores").default(300),
  setupDate: timestamp("setup_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_factory_setups_company").on(table.companyId),
]);

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  factoryId: varchar("factory_id").references(() => factorySetups.id),
  type: varchar("type").notNull(), // 'optimization', 'market', 'expansion', 'cost_reduction'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  impact: varchar("impact").notNull(), // 'high', 'medium', 'low'
  estimatedValue: varchar("estimated_value").notNull(),
  actionRequired: boolean("action_required").default(false),
  status: varchar("status").default("pending"), // 'pending', 'in_progress', 'completed', 'dismissed'
  confidence: integer("confidence").default(85), // AI confidence percentage
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_ai_insights_company").on(table.companyId),
]);

export const productionMetrics = pgTable("production_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  factoryId: varchar("factory_id").notNull().references(() => factorySetups.id),
  metricDate: timestamp("metric_date").notNull(),
  dailyOutput: integer("daily_output").default(0),
  efficiency: varchar("efficiency").default("0"), // percentage as string for precision
  qualityScore: varchar("quality_score").default("0"), // percentage as string
  wasteReduction: varchar("waste_reduction").default("0"), // percentage as string
  energySavings: varchar("energy_savings").default("0"), // percentage as string
  profitMargin: varchar("profit_margin").default("0"), // percentage as string
  maintenanceHours: integer("maintenance_hours").default(0),
  downtime: integer("downtime").default(0), // minutes
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_production_metrics_company").on(table.companyId),
]);

export const factoryRecommendations = pgTable("factory_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  factoryId: varchar("factory_id").notNull().references(() => factorySetups.id),
  recommendation: text("recommendation").notNull(),
  category: varchar("category").notNull(), // 'inventory', 'optimization', 'maintenance', 'expansion'
  priority: varchar("priority").notNull().default("medium"), // 'high', 'medium', 'low'
  estimatedImpact: varchar("estimated_impact"), // financial or operational impact
  status: varchar("status").default("pending"), // 'pending', 'implemented', 'dismissed'
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_factory_recommendations_company").on(table.companyId),
]);

// Extended Automation Tables
export const automationRules = pgTable("automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  ruleName: varchar("rule_name").notNull(),
  category: varchar("category").notNull(), // 'inventory', 'production', 'maintenance', 'quality', 'distribution'
  triggerType: varchar("trigger_type").notNull(), // 'threshold', 'schedule', 'event', 'predictive'
  triggerCondition: jsonb("trigger_condition").notNull(), // flexible condition data
  actionType: varchar("action_type").notNull(), // 'reorder', 'schedule', 'alert', 'optimize', 'adjust'
  actionParameters: jsonb("action_parameters").notNull(), // action configuration
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(2), // 1=high, 2=medium, 3=low
  lastTriggered: timestamp("last_triggered"),
  executionCount: integer("execution_count").default(0),
  successRate: varchar("success_rate").default("0.00"), // percentage as string
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_automation_rules_company").on(table.companyId),
]);

export const automationEvents = pgTable("automation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  ruleId: varchar("rule_id").notNull().references(() => automationRules.id),
  eventType: varchar("event_type").notNull(), // 'triggered', 'executed', 'failed', 'completed'
  status: varchar("status").notNull(), // 'success', 'failed', 'pending', 'cancelled'
  triggerData: jsonb("trigger_data"), // data that triggered the rule
  result: jsonb("result"), // execution result or error details
  executionTime: integer("execution_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_automation_events_company").on(table.companyId),
]);

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  equipmentName: varchar("equipment_name").notNull(),
  maintenanceType: varchar("maintenance_type").notNull(), // 'preventive', 'predictive', 'corrective'
  factoryId: varchar("factory_id").references(() => factorySetups.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  estimatedDuration: integer("estimated_duration"), // minutes
  priority: varchar("priority").notNull().default("medium"), // 'high', 'medium', 'low'
  status: varchar("status").notNull().default("scheduled"), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  assignedTechnician: varchar("assigned_technician"),
  checklist: jsonb("checklist"), // maintenance tasks
  notes: text("notes"),
  cost: varchar("cost").default("0.00"), // cost as string for precision
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maintenance_schedules_company").on(table.companyId),
]);

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  products: many(products),
  inventory: many(inventory),
  distributors: many(distributors),
  orders: many(orders),
  salesReps: many(salesReps),
  hardwareStores: many(hardwareStores),
  factorySetups: many(factorySetups),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, { fields: [products.companyId], references: [companies.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
  orderItems: many(orderItems),
  productionSchedule: many(productionSchedule),
  demandForecast: many(demandForecast),
  salesMetrics: many(salesMetrics),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  company: one(companies, { fields: [inventory.companyId], references: [companies.id] }),
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

export const distributorsRelations = relations(distributors, ({ one, many }) => ({
  company: one(companies, { fields: [distributors.companyId], references: [companies.id] }),
  orders: many(orders),
  salesMetrics: many(salesMetrics),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  company: one(companies, { fields: [orders.companyId], references: [companies.id] }),
  distributor: one(distributors, { fields: [orders.distributorId], references: [distributors.id] }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  company: one(companies, { fields: [orderItems.companyId], references: [companies.id] }),
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const productionScheduleRelations = relations(productionSchedule, ({ one }) => ({
  company: one(companies, { fields: [productionSchedule.companyId], references: [companies.id] }),
  product: one(products, { fields: [productionSchedule.productId], references: [products.id] }),
}));

export const demandForecastRelations = relations(demandForecast, ({ one }) => ({
  company: one(companies, { fields: [demandForecast.companyId], references: [companies.id] }),
  product: one(products, { fields: [demandForecast.productId], references: [products.id] }),
}));

export const salesMetricsRelations = relations(salesMetrics, ({ one }) => ({
  company: one(companies, { fields: [salesMetrics.companyId], references: [companies.id] }),
  product: one(products, { fields: [salesMetrics.productId], references: [products.id] }),
  distributor: one(distributors, { fields: [salesMetrics.distributorId], references: [distributors.id] }),
}));

export const salesRepsRelations = relations(salesReps, ({ one, many }) => ({
  company: one(companies, { fields: [salesReps.companyId], references: [companies.id] }),
  routePlans: many(routePlans),
  storeVisits: many(storeVisits),
}));

export const hardwareStoresRelations = relations(hardwareStores, ({ one, many }) => ({
  company: one(companies, { fields: [hardwareStores.companyId], references: [companies.id] }),
  routeStores: many(routeStores),
  aiOrderSuggestions: many(aiOrderSuggestions),
  storeVisits: many(storeVisits),
}));

export const routePlansRelations = relations(routePlans, ({ one, many }) => ({
  company: one(companies, { fields: [routePlans.companyId], references: [companies.id] }),
  salesRep: one(salesReps, { fields: [routePlans.salesRepId], references: [salesReps.id] }),
  routeStores: many(routeStores),
}));

export const routeStoresRelations = relations(routeStores, ({ one }) => ({
  routePlan: one(routePlans, { fields: [routeStores.routePlanId], references: [routePlans.id] }),
  hardwareStore: one(hardwareStores, { fields: [routeStores.hardwareStoreId], references: [hardwareStores.id] }),
}));

export const aiOrderSuggestionsRelations = relations(aiOrderSuggestions, ({ one }) => ({
  hardwareStore: one(hardwareStores, { fields: [aiOrderSuggestions.hardwareStoreId], references: [hardwareStores.id] }),
  product: one(products, { fields: [aiOrderSuggestions.productId], references: [products.id] }),
}));

export const storeVisitsRelations = relations(storeVisits, ({ one }) => ({
  hardwareStore: one(hardwareStores, { fields: [storeVisits.hardwareStoreId], references: [hardwareStores.id] }),
  salesRep: one(salesReps, { fields: [storeVisits.salesRepId], references: [salesReps.id] }),
}));

// Factory relations
export const factorySetupsRelations = relations(factorySetups, ({ one, many }) => ({
  company: one(companies, { fields: [factorySetups.companyId], references: [companies.id] }),
  aiInsights: many(aiInsights),
  productionMetrics: many(productionMetrics),
  recommendations: many(factoryRecommendations),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  company: one(companies, { fields: [aiInsights.companyId], references: [companies.id] }),
  factory: one(factorySetups, { fields: [aiInsights.factoryId], references: [factorySetups.id] }),
}));

export const productionMetricsRelations = relations(productionMetrics, ({ one }) => ({
  company: one(companies, { fields: [productionMetrics.companyId], references: [companies.id] }),
  factory: one(factorySetups, { fields: [productionMetrics.factoryId], references: [factorySetups.id] }),
}));

export const factoryRecommendationsRelations = relations(factoryRecommendations, ({ one }) => ({
  company: one(companies, { fields: [factoryRecommendations.companyId], references: [companies.id] }),
  factory: one(factorySetups, { fields: [factoryRecommendations.factoryId], references: [factorySetups.id] }),
}));

export const automationRulesRelations = relations(automationRules, ({ one, many }) => ({
  company: one(companies, { fields: [automationRules.companyId], references: [companies.id] }),
  events: many(automationEvents),
}));

export const automationEventsRelations = relations(automationEvents, ({ one }) => ({
  rule: one(automationRules, { fields: [automationEvents.ruleId], references: [automationRules.id] }),
}));

export const maintenanceSchedulesRelations = relations(maintenanceSchedules, ({ one }) => ({
  company: one(companies, { fields: [maintenanceSchedules.companyId], references: [companies.id] }),
  factory: one(factorySetups, { fields: [maintenanceSchedules.factoryId], references: [factorySetups.id] }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export const insertDistributorSchema = createInsertSchema(distributors).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertProductionScheduleSchema = createInsertSchema(productionSchedule).omit({ id: true, createdAt: true });
export const insertDemandForecastSchema = createInsertSchema(demandForecast).omit({ id: true, createdAt: true });
export const insertSalesMetricsSchema = createInsertSchema(salesMetrics).omit({ id: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export const insertSalesRepSchema = createInsertSchema(salesReps).omit({ id: true, createdAt: true });
export const insertHardwareStoreSchema = createInsertSchema(hardwareStores).omit({ id: true, createdAt: true });
export const insertRoutePlanSchema = createInsertSchema(routePlans).omit({ id: true, createdAt: true });
export const insertRouteStoreSchema = createInsertSchema(routeStores).omit({ id: true });
export const insertAiOrderSuggestionSchema = createInsertSchema(aiOrderSuggestions).omit({ id: true, createdAt: true });
export const insertStoreVisitSchema = createInsertSchema(storeVisits).omit({ id: true, createdAt: true });

// Factory schemas
export const insertFactorySetupSchema = createInsertSchema(factorySetups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertProductionMetricsSchema = createInsertSchema(productionMetrics).omit({ id: true, createdAt: true });
export const insertFactoryRecommendationSchema = createInsertSchema(factoryRecommendations).omit({ id: true, createdAt: true });

// Type exports moved to end of file
export type InsertProductionMetrics = z.infer<typeof insertProductionMetricsSchema>;
export type FactoryRecommendation = typeof factoryRecommendations.$inferSelect;

// Extended Automation Types
export const insertAutomationRuleSchema = createInsertSchema(automationRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAutomationEventSchema = createInsertSchema(automationEvents).omit({ id: true, createdAt: true });
export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;
export type InsertAutomationEvent = z.infer<typeof insertAutomationEventSchema>;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;

export type AutomationRule = typeof automationRules.$inferSelect;
export type AutomationEvent = typeof automationEvents.$inferSelect;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertFactoryRecommendation = z.infer<typeof insertFactoryRecommendationSchema>;

// Excel Upload Tables
export const excelUploads = pgTable("excel_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: varchar("file_name").notNull(),
  mappedName: varchar("mapped_name").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  storesCount: integer("stores_count").default(0),
  routesCount: integer("routes_count").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

export const hardwareStoresFromExcel = pgTable("hardware_stores_from_excel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id").references(() => excelUploads.id),
  storeName: varchar("store_name").notNull(),
  storeAddress: text("store_address"),
  cityTown: varchar("city_town"),
  province: varchar("province"),
  contactPerson: varchar("contact_person"),
  phoneNumber: varchar("phone_number"),
  repName: varchar("rep_name"),
  visitFrequency: varchar("visit_frequency"),
  mappedToCornex: varchar("mapped_to_cornex").notNull(), // The Cornex mapping
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesRepRoutesFromExcel = pgTable("sales_rep_routes_from_excel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id").references(() => excelUploads.id),
  repName: varchar("rep_name").notNull(),
  routeName: varchar("route_name"),
  storeId: varchar("store_id").references(() => hardwareStoresFromExcel.id),
  visitDay: varchar("visit_day"),
  visitFrequency: varchar("visit_frequency"),
  priority: integer("priority").default(1),
  mappedToCornex: varchar("mapped_to_cornex").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Excel upload relations
export const excelUploadsRelations = relations(excelUploads, ({ many }) => ({
  hardwareStores: many(hardwareStoresFromExcel),
  salesRepRoutes: many(salesRepRoutesFromExcel),
}));

export const hardwareStoresFromExcelRelations = relations(hardwareStoresFromExcel, ({ one, many }) => ({
  upload: one(excelUploads, { fields: [hardwareStoresFromExcel.uploadId], references: [excelUploads.id] }),
  routes: many(salesRepRoutesFromExcel),
}));

export const salesRepRoutesFromExcelRelations = relations(salesRepRoutesFromExcel, ({ one }) => ({
  upload: one(excelUploads, { fields: [salesRepRoutesFromExcel.uploadId], references: [excelUploads.id] }),
  store: one(hardwareStoresFromExcel, { fields: [salesRepRoutesFromExcel.storeId], references: [hardwareStoresFromExcel.id] }),
}));

// Excel upload schemas
export const insertExcelUploadSchema = createInsertSchema(excelUploads).omit({ id: true, uploadedAt: true });
export const insertHardwareStoreFromExcelSchema = createInsertSchema(hardwareStoresFromExcel).omit({ id: true, createdAt: true });
export const insertSalesRepRouteFromExcelSchema = createInsertSchema(salesRepRoutesFromExcel).omit({ id: true, createdAt: true });

// Excel upload types
export type ExcelUpload = typeof excelUploads.$inferSelect;
export type InsertExcelUpload = z.infer<typeof insertExcelUploadSchema>;
export type HardwareStoreFromExcel = typeof hardwareStoresFromExcel.$inferSelect;
export type InsertHardwareStoreFromExcel = z.infer<typeof insertHardwareStoreFromExcelSchema>;
export type SalesRepRouteFromExcel = typeof salesRepRoutesFromExcel.$inferSelect;
export type InsertSalesRepRouteFromExcel = z.infer<typeof insertSalesRepRouteFromExcelSchema>;

// Purchase Order System Tables
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  poNumber: varchar("po_number").notNull(), // Auto-generated PO number
  customerId: varchar("customer_id"), // Can reference distributors or be standalone
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerCity: text("customer_city"),
  customerRegion: text("customer_region"),
  customerCountry: text("customer_country").notNull(),
  
  // Order details
  orderDate: timestamp("order_date").defaultNow(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  urgencyLevel: text("urgency_level").notNull().default("standard"), // urgent, high, standard, low
  currency: text("currency").notNull().default("ZAR"),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // Status and workflow
  status: text("status").notNull().default("pending"), // pending, approved, in_production, ready_to_ship, shipped, delivered, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Private notes for internal use
  
  // Tracking
  assignedTo: varchar("assigned_to").references(() => users.id), // Sales rep or manager handling this PO
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  
  // Metadata
  source: text("source").notNull().default("manual"), // manual, excel_upload, api, website
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  purchaseOrderId: varchar("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  
  // Item details
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  
  // Production details
  estimatedProductionTime: integer("estimated_production_time"), // in hours
  actualProductionTime: integer("actual_production_time"), // in hours
  productionStatus: text("production_status").default("not_started"), // not_started, in_progress, completed
  
  // Special requirements
  customSpecifications: text("custom_specifications"),
  packagingNotes: text("packaging_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const poStatusHistory = pgTable("po_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  purchaseOrderId: varchar("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: varchar("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const poDocuments = pgTable("po_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  purchaseOrderId: varchar("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // invoice, receipt, shipping_label, custom_specs
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Purchase Order Relations
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  company: one(companies, { fields: [purchaseOrders.companyId], references: [companies.id] }),
  items: many(purchaseOrderItems),
  statusHistory: many(poStatusHistory),
  documents: many(poDocuments),
  approver: one(users, { fields: [purchaseOrders.approvedBy], references: [users.id] }),
  assignee: one(users, { fields: [purchaseOrders.assignedTo], references: [users.id] }),
  creator: one(users, { fields: [purchaseOrders.createdBy], references: [users.id] }),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  company: one(companies, { fields: [purchaseOrderItems.companyId], references: [companies.id] }),
  purchaseOrder: one(purchaseOrders, { fields: [purchaseOrderItems.purchaseOrderId], references: [purchaseOrders.id] }),
  product: one(products, { fields: [purchaseOrderItems.productId], references: [products.id] }),
}));

export const poStatusHistoryRelations = relations(poStatusHistory, ({ one }) => ({
  company: one(companies, { fields: [poStatusHistory.companyId], references: [companies.id] }),
  purchaseOrder: one(purchaseOrders, { fields: [poStatusHistory.purchaseOrderId], references: [purchaseOrders.id] }),
  changedBy: one(users, { fields: [poStatusHistory.changedBy], references: [users.id] }),
}));

export const poDocumentsRelations = relations(poDocuments, ({ one }) => ({
  company: one(companies, { fields: [poDocuments.companyId], references: [companies.id] }),
  purchaseOrder: one(purchaseOrders, { fields: [poDocuments.purchaseOrderId], references: [purchaseOrders.id] }),
  uploadedBy: one(users, { fields: [poDocuments.uploadedBy], references: [users.id] }),
}));

// Purchase Order Zod Schemas
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).extend({
  orderDate: z.coerce.date().optional(),
  requestedDeliveryDate: z.coerce.date().optional(),
  estimatedCompletionDate: z.coerce.date().optional(),
  actualCompletionDate: z.coerce.date().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true });
export const insertPoStatusHistorySchema = createInsertSchema(poStatusHistory).omit({ id: true, timestamp: true });
export const insertPoDocumentSchema = createInsertSchema(poDocuments).omit({ id: true, uploadedAt: true });

// Company and base types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Distributor = typeof distributors.$inferSelect;
export type InsertDistributor = z.infer<typeof insertDistributorSchema>;

// Purchase Order types
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPoStatusHistory = typeof poStatusHistory.$inferInsert;
export type PoStatusHistory = typeof poStatusHistory.$inferSelect;
export type InsertPoDocument = typeof poDocuments.$inferInsert;
export type PoDocument = typeof poDocuments.$inferSelect;

// Additional types
export type Order = typeof orders.$inferSelect;
export type SalesRep = typeof salesReps.$inferSelect;
export type HardwareStore = typeof hardwareStores.$inferSelect;
export type FactorySetup = typeof factorySetups.$inferSelect;
export type Brand = typeof brands.$inferSelect;
