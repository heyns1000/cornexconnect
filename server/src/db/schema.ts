import { pgTable, text, integer, timestamp, decimal, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// SKUs table - 31+ products
export const skus = pgTable('skus', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku_code: varchar('sku_code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  stock_quantity: integer('stock_quantity').default(0),
  reorder_level: integer('reorder_level').default(10),
  dimensions: jsonb('dimensions'), // { length, width, height, weight }
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Currencies table - 190+ currencies
export const currencies = pgTable('currencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 3 }).notNull().unique(), // ISO 4217
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }),
  exchange_rate: decimal('exchange_rate', { precision: 15, scale: 6 }).notNull(),
  is_active: boolean('is_active').default(true),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  customer_code: varchar('customer_code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  preferred_currency: varchar('preferred_currency', { length: 3 }).default('ZAR'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: varchar('order_number', { length: 50 }).notNull().unique(),
  customer_id: uuid('customer_id').references(() => customers.id),
  order_date: timestamp('order_date').defaultNow(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, processing, shipped, delivered, cancelled
  total_amount: decimal('total_amount', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  shipping_address: text('shipping_address'),
  logistics_provider: varchar('logistics_provider', { length: 100 }), // RouteMesh, Unitrans, etc
  tracking_number: varchar('tracking_number', { length: 100 }),
  delivery_date: timestamp('delivery_date'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Order Items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id).notNull(),
  sku_id: uuid('sku_id').references(() => skus.id).notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Logistics table - RouteMesh and Unitrans integration
export const logistics = pgTable('logistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(), // RouteMesh, Unitrans
  tracking_number: varchar('tracking_number', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  pickup_address: text('pickup_address'),
  delivery_address: text('delivery_address'),
  estimated_delivery: timestamp('estimated_delivery'),
  actual_delivery: timestamp('actual_delivery'),
  route_data: jsonb('route_data'), // RouteMesh specific data
  cost: decimal('cost', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// AI Forecasting table
export const forecasts = pgTable('forecasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku_id: uuid('sku_id').references(() => skus.id).notNull(),
  forecast_date: timestamp('forecast_date').notNull(),
  predicted_demand: integer('predicted_demand'),
  confidence_level: decimal('confidence_level', { precision: 5, scale: 2 }),
  actual_demand: integer('actual_demand'),
  model_version: varchar('model_version', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
});

// Import History table - for Excel/CSV imports
export const importHistory = pgTable('import_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 10 }).notNull(), // csv, xlsx
  records_total: integer('records_total'),
  records_successful: integer('records_successful'),
  records_failed: integer('records_failed'),
  error_log: jsonb('error_log'),
  imported_by: varchar('imported_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id],
  }),
  items: many(orderItems),
  logistics: many(logistics),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  sku: one(skus, {
    fields: [orderItems.sku_id],
    references: [skus.id],
  }),
}));

export const skusRelations = relations(skus, ({ many }) => ({
  orderItems: many(orderItems),
  forecasts: many(forecasts),
}));

export const forecastsRelations = relations(forecasts, ({ one }) => ({
  sku: one(skus, {
    fields: [forecasts.sku_id],
    references: [skus.id],
  }),
}));

export const logisticsRelations = relations(logistics, ({ one }) => ({
  order: one(orders, {
    fields: [logistics.order_id],
    references: [orders.id],
  }),
}));
