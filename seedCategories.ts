import { getDb } from "./db";
import { orderCategories, orderSubcategories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const CATEGORIES = [
  {
    name: "envases",
    displayName: "Envases",
    description: "Envases y embalajes",
  },
  {
    name: "campo",
    displayName: "Campo",
    description: "Productos y materiales para campo",
  },
  {
    name: "repuestos",
    displayName: "Repuestos",
    description: "Repuestos y piezas",
  },
  {
    name: "limpieza",
    displayName: "Productos de Limpieza",
    description: "Productos de limpieza",
  },
  {
    name: "oficina",
    displayName: "Material de Oficina",
    description: "Material de oficina",
  },
  {
    name: "epis",
    displayName: "Equipos de Protección Individual (EPIs)",
    description: "EPIs y equipos de protección",
  },
  {
    name: "etiquetas",
    displayName: "Etiquetas",
    description: "Etiquetas",
  },
  {
    name: "otros",
    displayName: "Otros Pedidos / Varios",
    description: "Otros pedidos y varios",
  },
];

const SUBCATEGORIES = [
  { categoryName: "campo", name: "fitosanitarios", displayName: "Productos Fitosanitarios" },
  { categoryName: "campo", name: "abonos", displayName: "Abonos" },
  { categoryName: "campo", name: "invernadero", displayName: "Materiales de Invernadero" },
  { categoryName: "campo", name: "riego", displayName: "Materiales de Riego" },
  { categoryName: "repuestos", name: "vehiculos", displayName: "Vehículos" },
  { categoryName: "repuestos", name: "herramientas", displayName: "Herramientas" },
];

export async function seedCategories() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    const categoryMap: Record<string, number> = {};
    
    // Insert or get categories
    for (const cat of CATEGORIES) {
      const existing = await db
        .select()
        .from(orderCategories)
        .where(eq(orderCategories.name, cat.name));
      
      if (existing.length > 0) {
        categoryMap[cat.name] = existing[0].id;
        console.log(`Category ${cat.displayName} already exists (ID: ${existing[0].id})`);
      } else {
        const result = await db.insert(orderCategories).values({
          name: cat.name,
          displayName: cat.displayName,
          description: cat.description,
        });
        
        const catId = (result as any).insertId;
        categoryMap[cat.name] = catId;
        console.log(`Created category: ${cat.displayName} (ID: ${catId})`);
      }
    }

    // Insert or get subcategories
    for (const subcat of SUBCATEGORIES) {
      const categoryId = categoryMap[subcat.categoryName];
      if (!categoryId) {
        console.error(`Category ${subcat.categoryName} not found in map`);
        continue;
      }

      const existing = await db
        .select()
        .from(orderSubcategories)
        .where(eq(orderSubcategories.categoryId, categoryId));
      
      const subcatExists = existing.some(s => s.name === subcat.name);
      if (subcatExists) {
        console.log(`Subcategory ${subcat.displayName} already exists`);
      } else {
        await db.insert(orderSubcategories).values({
          categoryId,
          name: subcat.name,
          displayName: subcat.displayName,
        });
        console.log(`Created subcategory: ${subcat.displayName}`);
      }
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
