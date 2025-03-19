"use client";
import AppLayout from "@/components/ui/pharmacien/AppLayout";
import { useId, useState } from "react";
import CategoriesPage from "./categories/page";
import SubcategoriesPage from "./subcategories/subcategories";

export default function MainPage() {
  const id = useId();
  const [selectedValue, setSelectedValue] = useState("categories");

  return (
    <AppLayout>
    <CategoriesPage />
    </AppLayout>
  );
}