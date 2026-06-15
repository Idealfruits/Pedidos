import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla de categorías de pedidos
export const orderCategories = mysqlTable("order_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderCategory = typeof orderCategories.$inferSelect;
export type InsertOrderCategory = typeof orderCategories.$inferInsert;

// Tabla de subcategorías (para Campo y Repuestos)
export const orderSubcategories = mysqlTable("order_subcategories", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderSubcategory = typeof orderSubcategories.$inferSelect;
export type InsertOrderSubcategory = typeof orderSubcategories.$inferInsert;

// Tabla de pedidos
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  subcategoryId: int("subcategoryId"),
  status: mysqlEnum("status", ["draft", "submitted", "in_progress", "completed", "cancelled"]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Tabla de líneas de producto dentro de un pedido
export const orderLines = mysqlTable("order_lines", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  code: varchar("code", { length: 100 }),
  link: text("link"),
  quantity: varchar("quantity", { length: 255 }).notNull(),
  urgency: mysqlEnum("urgency", ["Alta", "Media", "Baja"]).default("Media").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }),
  photoKey: varchar("photoKey", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderLine = typeof orderLines.$inferSelect;
export type InsertOrderLine = typeof orderLines.$inferInsert;

// Relaciones
export const ordersRelations = relations(orders, ({ many, one }) => ({
  lines: many(orderLines),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  category: one(orderCategories, { fields: [orders.categoryId], references: [orderCategories.id] }),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, { fields: [orderLines.orderId], references: [orders.id] }),
}));

export const orderCategoriesRelations = relations(orderCategories, ({ many }) => ({
  subcategories: many(orderSubcategories),
  orders: many(orders),
}));

export const orderSubcategoriesRelations = relations(orderSubcategories, ({ one }) => ({
  category: one(orderCategories, { fields: [orderSubcategories.categoryId], references: [orderCategories.id] }),
}));