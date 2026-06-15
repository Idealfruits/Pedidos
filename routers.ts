import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createOrder, addOrderLine, getOrdersByUserId, getOrderWithLines, getAllOrders, getOrderCategoriesWithSubcategories } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    // Obtener categorías con subcategorías
    getCategories: publicProcedure.query(async () => {
      return getOrderCategoriesWithSubcategories();
    }),

    // Crear un nuevo pedido con líneas de producto
    create: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          subcategoryId: z.number().optional(),
          userName: z.string().min(1, "El nombre de usuario es requerido"),
          lines: z.array(
            z.object({
              productName: z.string().min(1, "El nombre del producto es requerido"),
              provider: z.string().optional(),
              code: z.string().optional(),
              link: z.string().optional(),
              quantity: z.string().min(1, "Las unidades solicitadas son requeridas"),
              urgency: z.enum(["Alta", "Media", "Baja"]),
              photoUrl: z.string().optional(),
              photoKey: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Crear el pedido
          const orderResult = await createOrder({
            userId: 0, // Pedido público sin usuario autenticado
            categoryId: input.categoryId,
            subcategoryId: input.subcategoryId,
            status: "submitted",
          });

          // Obtener el ID del pedido creado
          const orderId = (orderResult as any).insertId;
          if (!orderId) {
            throw new Error("Failed to get order ID after creation");
          }

          // Añadir las líneas de producto
          for (const line of input.lines) {
            await addOrderLine({
              orderId,
              productName: line.productName,
              provider: line.provider || null,
              code: line.code || null,
              link: line.link || null,
              quantity: line.quantity,
              urgency: line.urgency,
              photoUrl: line.photoUrl || null,
              photoKey: line.photoKey || null,
            });
          }

          // Notificar al propietario
          await notifyOwner({
            title: "Nuevo pedido creado",
            content: `${input.userName} ha creado un nuevo pedido con ${input.lines.length} producto(s).`,
          });

          // Enviar webhook a n8n para Gmail
          try {
            const webhookUrl = "https://n8n.srv1743648.hstgr.cloud/webhook/PortalPedidos";
            const orderData = {
              orderId,
              Usuario: input.userName,
              Categoria: input.categoryId,
              Subcategoria: input.subcategoryId,
              "Cantidad de Productos": input.lines.length,
              Productos: input.lines,
              "Fecha de Envío": new Date().toISOString(),
            };

            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            }).catch((err) => console.error("Error sending webhook to n8n:", err));
          } catch (webhookError) {
            console.error("Webhook error:", webhookError);
          }

          return { id: orderId, success: true };
        } catch (error) {
          console.error("Error creating order:", error);
          throw error;
        }
      }),

    // Obtener todos los pedidos
    getMyOrders: publicProcedure.query(async () => {
      return getAllOrders();
    }),

    // Obtener todos los pedidos (solo para admin)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("No tienes permiso para ver todos los pedidos");
      }
      return getAllOrders();
    }),

    // Obtener un pedido específico con sus líneas
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getOrderWithLines(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
