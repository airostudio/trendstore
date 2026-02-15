import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  tenantId: z.string().cuid("Invalid tenant ID"),
  price: z.number().int().min(0, "Price must be non-negative").optional(),
  sku: z.string().optional(),
});

export const cartItemSchema = z.object({
  variantId: z.string().cuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().int().min(0, "Unit price must be non-negative").optional(),
});

export const createCartSchema = z.object({
  tenantId: z.string().cuid("Invalid tenant ID"),
  customerId: z.string().cuid("Invalid customer ID").optional(),
  items: z.array(cartItemSchema).min(1, "Cart must have at least one item"),
});

export const orderItemSchema = z.object({
  variantId: z.string().cuid("Invalid variant ID"),
  title: z.string().min(1, "Title is required"),
  sku: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().int().min(0, "Unit price must be non-negative"),
});

export const createOrderSchema = z.object({
  tenantId: z.string().cuid("Invalid tenant ID"),
  customerId: z.string().cuid("Invalid customer ID").optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  subtotal: z.number().int().min(0, "Subtotal must be non-negative"),
  total: z.number().int().min(0, "Total must be non-negative"),
});
