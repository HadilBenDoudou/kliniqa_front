// src/lib/schemas.ts
import { z } from "zod";

export const createProductSchema = z.object({
  nom: z.string().min(1, "Product name is required"),
  ref: z.string().min(1, "Reference is required"),
  desc: z.string().optional(),
  qt_stock: z.number().int().nonnegative().default(0),
  en_stock: z.boolean().default(true),
  prix: z.number().positive("Price must be positive"),
  subcategory_id: z.number().int().positive("Subcategory ID is required"),
  brand: z.string().optional(),
  created_by: z.number().int().positive("Created by user ID is required"),
  image: z
    .instanceof(File, { message: "Image must be a file" })
    .optional()
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "File must be an image",
    }),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(255, "Category name must be 255 characters or less")
    .regex(/^[a-zA-Z\s]+$/, "Category name must contain only letters and spaces"),
});

export const createSubcategorySchema = z.object({
  name: z
    .string()
    .min(1, "Subcategory name is required")
    .max(255, "Subcategory name must be 255 characters or less")
    .regex(/^[a-zA-Z\s]+$/, "Subcategory name must contain only letters and spaces"),
  category_id: z.number().int().positive("Category ID is required"),
});