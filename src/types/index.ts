import { z } from "zod/v4";
import { loginSchema, productSchema, categorySchema, customerSchema, supplierSchema, saleSchema, saleItemSchema, stockMovementSchema, userSchema, storeSchema } from "@/src/lib/validations";

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type StoreInput = z.infer<typeof storeSchema>;

export type Role = "ADMIN" | "CASHIER";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
export type StockType = "IN" | "OUT";

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}