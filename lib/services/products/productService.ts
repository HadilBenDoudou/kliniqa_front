// src/lib/services/products/productService.ts
import apiClient from "@/lib/api-client";

export interface Product {
  id: number;
  nom: string;
  ref: string;
  desc?: string;
  qt_stock: number;
  en_stock: boolean;
  prix: number;
  subcategory_id: number;
  brand?: string;
  created_by: number;
  image?: string; // Backend returns the URL
}

export interface CreateProductInput {
  nom: string;
  ref: string;
  desc?: string;
  qt_stock: number;
  en_stock: boolean;
  prix: number;
  subcategory_id: number;
  brand?: string;
  created_by: number;
  image?: File; // File object for upload
}

export const fetchProducts = async (userId: number, subcategoryId?: number): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>("/product/products", {
    params: { userId, subcategoryId },
  });
  return response.data;
};

export const createProduct = async (productData: CreateProductInput): Promise<Product> => {
  const formData = new FormData();
  formData.append("nom", productData.nom);
  formData.append("ref", productData.ref);
  if (productData.desc) formData.append("desc", productData.desc);
  formData.append("qt_stock", productData.qt_stock.toString());
  formData.append("en_stock", productData.en_stock.toString());
  formData.append("prix", productData.prix.toString());
  formData.append("subcategory_id", productData.subcategory_id.toString());
  if (productData.brand) formData.append("brand", productData.brand);
  formData.append("created_by", productData.created_by.toString());
  if (productData.image) formData.append("image", productData.image);

  try {
    const response = await apiClient.post<Product>("/product/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.log("Error response from server:", JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};