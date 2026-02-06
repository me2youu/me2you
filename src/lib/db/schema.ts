import { pgTable, text, timestamp, uuid, decimal, integer, jsonb, boolean, varchar } from 'drizzle-orm/pg-core';

// Users table (synced from Clerk via webhook)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  promotionalEmails: boolean('promotional_emails').default(true).notNull(),
});

// Templates table
export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  occasion: text('occasion').array().notNull(), // ['valentines', 'birthday', etc.]
  thumbnailUrl: text('thumbnail_url'),
  htmlTemplate: text('html_template').notNull(), // HTML with {{variables}}
  cssTemplate: text('css_template'),
  jsTemplate: text('js_template'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by'), // Admin user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add-ons table (future use)
export const addons = pgTable('addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'animation', 'audio', 'countdown', 'qr'
  configSchema: jsonb('config_schema'), // JSON schema for addon configuration
  isActive: boolean('is_active').default(true).notNull(),
});

// Gifts table (personalized instances)
export const gifts = pgTable('gifts', {
  id: varchar('id', { length: 12 }).primaryKey(), // Short unique ID (nanoid)
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  createdBy: text('created_by'), // User ID (nullable for guest checkouts)
  recipientName: text('recipient_name').notNull(),
  customMessage: text('custom_message'),
  customData: jsonb('custom_data').notNull(), // All personalization data
  selectedAddons: jsonb('selected_addons'), // Array of addon IDs + configs
  htmlSnapshot: text('html_snapshot').notNull(), // Rendered HTML for fast serving
  shortUrl: varchar('short_url', { length: 12 }).notNull().unique(), // Same as id
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration (future use)
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  giftId: varchar('gift_id', { length: 12 }).references(() => gifts.id).notNull(),
  userId: text('user_id'), // Nullable for guest checkouts
  email: text('email').notNull(),
  paystackReference: text('paystack_reference'), // Paystack transaction reference
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Contact queries table
export const contactQueries = pgTable('contact_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(), // 'new', 'read', 'replied'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type Gift = typeof gifts.$inferSelect;
export type Order = typeof orders.$inferSelect;

export type NewUser = typeof users.$inferInsert;
export type NewTemplate = typeof templates.$inferInsert;
export type NewAddon = typeof addons.$inferInsert;
export type NewGift = typeof gifts.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;
export type ContactQuery = typeof contactQueries.$inferSelect;
export type NewContactQuery = typeof contactQueries.$inferInsert;
