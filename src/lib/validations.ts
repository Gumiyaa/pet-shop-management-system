import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  cost: z.coerce.number().min(0, "Cost must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  minStock: z.coerce.number().int().min(0, "Min stock must be non-negative"),
  barcode: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  active: z.boolean().optional().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0),
});

export const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  discount: z.coerce.number().min(0).optional().default(0),
  tax: z.coerce.number().min(0).optional().default(0),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]),
  amountPaid: z.coerce.number().min(0, "Amount must be positive"),
  notes: z.string().optional(),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "CASHIER"]),
  active: z.boolean().optional().default(true),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email("Invalid email").optional().or(z.literal("")),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  currency: z.string().optional().default("VND"),
});