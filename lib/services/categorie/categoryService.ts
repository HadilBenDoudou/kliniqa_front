import apiClient from "@/lib/api-client";
import { Product } from "../products/productService";

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>("/categorie/categories");
    console.log("fetchCategories response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchSubcategories = async (categoryId?: number): Promise<Subcategory[]> => {
  try {
    const response = await apiClient.get<Subcategory[]>("/categorie/subcategories", {
      params: { categoryId },
    });
    console.log("fetchSubcategories response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

export const createCategory = async (categoryData: { name: string }): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>(
      "/categorie/categories",
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("createCategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const createSubcategory = async (subcategoryData: {
  name: string;
  category_id: number;
}): Promise<Subcategory> => {
  try {
    const response = await apiClient.post<Subcategory>(
      "/categorie/subcategories",
      subcategoryData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("createSubcategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating subcategory:", error);
    throw error;
  }
};

export const fetchSubcategoriesByCategory = async (categoryId: number): Promise<Subcategory[]> => {
  try {
    const response = await apiClient.get<Subcategory[]>(
      `/categorie/subcategories/by-category/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("fetchSubcategoriesByCategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching subcategories by category:", error);
    throw error;
  }
};

export const fetchProductsBySubcategory = async (subcategoryId: number): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>(
      `/product/products/by-subcategory/${subcategoryId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("fetchProductsBySubcategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching products by subcategory:", error);
    throw error;
  }
};

export const updateCategory = async ({
  userId,
  id,
  name,
}: {
  userId: number;
  id: number;
  name: string;
}): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(
      `/categorie/categories/${id}`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("updateCategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async ({ userId, id }: { userId: number; id: number }): Promise<void> => {
  try {
    await apiClient.delete(`/categorie/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(`Category ${id} deleted`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const updateSubcategory = async ({
  userId,
  id,
  name,
}: {
  userId: number;
  id: number;
  name: string;
}): Promise<Subcategory> => {
  try {
    const response = await apiClient.put<Subcategory>(
      `/categorie/subcategories/${id}`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("updateSubcategory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw error;
  }
};

export const deleteSubcategory = async ({ userId, id }: { userId: number; id: number }): Promise<void> => {
  try {
    await apiClient.delete(`/categorie/subcategories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(`Subcategory ${id} deleted`);
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    throw error;
  }
};