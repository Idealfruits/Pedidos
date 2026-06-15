import { z } from "zod";

export const orderLineSchema = z.object({
  productName: z.string().min(1, "El nombre del producto es requerido"),
  provider: z.string().optional(),
  code: z.string().optional(),
  link: z.string().optional(),
  quantity: z.string().min(1, "Las unidades solicitadas son requeridas"),
  urgency: z.enum(["Alta", "Media", "Baja"]),
  photoUrl: z.string().optional(),
  photoKey: z.string().optional(),
});

export const orderFormSchema = z.object({
  userName: z.string().min(1, "El nombre de usuario es requerido"),
  lines: z.array(orderLineSchema).min(1, "Debes añadir al menos un producto"),
});

export const createOrderSchema = z.object({
  categoryId: z.number().min(1),
  subcategoryId: z.number().optional(),
  userName: z.string().min(1),
  lines: z.array(orderLineSchema).min(1),
});

export type OrderLine = z.infer<typeof orderLineSchema>;
export type OrderForm = z.infer<typeof orderFormSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
