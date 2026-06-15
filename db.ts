import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orderCategories, orderSubcategories, orders, orderLines, InsertOrder, InsertOrderLine } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funciones para gestionar categorías
export async function getOrderCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderCategories);
}

export async function getOrderCategoriesWithSubcategories() {
  const db = await getDb();
  if (!db) return [];
  const categories = await db.select().from(orderCategories);
  const categoriesWithSubs = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      subcategories: await db
        .select()
        .from(orderSubcategories)
        .where(eq(orderSubcategories.categoryId, cat.id)),
    }))
  );
  return categoriesWithSubs;
}

// Funciones para gestionar pedidos
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  // Retornar el ID del pedido creado
  // Drizzle retorna { insertId: number } para MySQL
  return result as unknown as { insertId: number };
}

export async function addOrderLine(line: InsertOrderLine) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderLines).values(line);
  return result;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
  
  // Enriquecer con líneas de producto
  const enriched = await Promise.all(
    userOrders.map(async (order) => {
      const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, order.id));
      return { ...order, lines };
    })
  );
  
  return enriched;
}

export async function getOrderWithLines(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order.length) return null;
  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, orderId));
  return { ...order[0], lines };
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}


