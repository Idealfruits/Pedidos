import { describe, it, expect } from "vitest";
import { orderLineSchema, orderFormSchema } from "../shared/schemas";
import { z } from "zod";

describe("Order Validation Schemas", () => {
  describe("orderLineSchema", () => {
    it("should validate a valid order line", () => {
      const validLine = {
        productName: "Test Product",
        quantity: 1,
        urgency: "Media",
      };

      const result = orderLineSchema.safeParse(validLine);
      expect(result.success).toBe(true);
    });

    it("should reject empty product name", () => {
      const invalidLine = {
        productName: "",
        quantity: 1,
        urgency: "Media",
      };

      const result = orderLineSchema.safeParse(invalidLine);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("requerido");
      }
    });

    it("should reject zero quantity", () => {
      const invalidLine = {
        productName: "Test Product",
        quantity: 0,
        urgency: "Media",
      };

      const result = orderLineSchema.safeParse(invalidLine);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("mayor");
      }
    });

    it("should reject invalid urgency", () => {
      const invalidLine = {
        productName: "Test Product",
        quantity: 1,
        urgency: "InvalidUrgency",
      };

      const result = orderLineSchema.safeParse(invalidLine);
      expect(result.success).toBe(false);
    });

    it("should accept all valid urgency levels", () => {
      const urgencies = ["Alta", "Media", "Baja"];

      for (const urgency of urgencies) {
        const line = {
          productName: "Test Product",
          quantity: 1,
          urgency: urgency as "Alta" | "Media" | "Baja",
        };

        const result = orderLineSchema.safeParse(line);
        expect(result.success).toBe(true);
      }
    });

    it("should accept optional fields", () => {
      const lineWithOptionals = {
        productName: "Test Product",
        quantity: 5,
        urgency: "Alta",
        provider: "Supplier Inc",
        code: "CODE123",
        link: "https://example.com",
      };

      const result = orderLineSchema.safeParse(lineWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe("orderFormSchema", () => {
    it("should validate a form with one product", () => {
      const validForm = {
        lines: [
          {
            productName: "Product 1",
            quantity: 1,
            urgency: "Media",
          },
        ],
      };

      const result = orderFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should validate a form with multiple products", () => {
      const validForm = {
        lines: [
          {
            productName: "Product 1",
            quantity: 1,
            urgency: "Alta",
          },
          {
            productName: "Product 2",
            quantity: 2,
            urgency: "Media",
            provider: "Supplier A",
          },
          {
            productName: "Product 3",
            quantity: 3,
            urgency: "Baja",
            code: "CODE123",
          },
        ],
      };

      const result = orderFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should reject form with no products", () => {
      const invalidForm = {
        lines: [],
      };

      const result = orderFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("al menos");
      }
    });

    it("should reject form with invalid product", () => {
      const invalidForm = {
        lines: [
          {
            productName: "",
            quantity: 1,
            urgency: "Media",
          },
        ],
      };

      const result = orderFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should validate mixed valid and invalid lines", () => {
      const form = {
        lines: [
          {
            productName: "Valid Product",
            quantity: 1,
            urgency: "Media",
          },
          {
            productName: "Invalid Product",
            quantity: 0,
            urgency: "Media",
          },
        ],
      };

      const result = orderFormSchema.safeParse(form);
      expect(result.success).toBe(false);
    });
  });

  describe("Urgency Levels", () => {
    it("should only accept Alta, Media, or Baja", () => {
      const validUrgencies = ["Alta", "Media", "Baja"];
      const invalidUrgencies = ["High", "Normal", "Low", "ALTA", "media", ""];

      for (const urgency of validUrgencies) {
        const result = z.enum(["Alta", "Media", "Baja"]).safeParse(urgency);
        expect(result.success).toBe(true);
      }

      for (const urgency of invalidUrgencies) {
        const result = z.enum(["Alta", "Media", "Baja"]).safeParse(urgency);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("Quantity Validation", () => {
    it("should accept positive integers", () => {
      const quantities = [1, 2, 5, 10, 100, 1000];

      for (const qty of quantities) {
        const result = z.number().min(1).safeParse(qty);
        expect(result.success).toBe(true);
      }
    });

    it("should reject zero and negative numbers", () => {
      const quantities = [0, -1, -10];

      for (const qty of quantities) {
        const result = z.number().min(1).safeParse(qty);
        expect(result.success).toBe(false);
      }
    });
  });
});
