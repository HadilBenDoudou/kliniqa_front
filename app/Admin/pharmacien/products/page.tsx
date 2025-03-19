"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/ui/pharmacien/AppLayout";
import ProductTable from "./ProductTable";
import ProductCardView from "./ProductCardView";
import { Button } from "@/components/ui/button";
import { Table2, LayoutGrid, Plus } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createCategory, fetchCategories, Category } from "@/lib/services/categorie/categoryService";
import { createSubcategory, Subcategory } from "@/lib/services/categorie/categoryService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const [userId, setUserId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = Number(localStorage.getItem("userId"));
      setUserId(storedUserId);
    }
  }, []);

  const { data: categories = [] } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsAddCategoryOpen(false);
      setCategoryName("");
    },
    onError: (error) => console.error("Error creating category:", error),
  });

  const subcategoryMutation = useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setIsAddSubcategoryOpen(false);
      setSubcategoryName("");
      setSelectedCategoryId(undefined);
    },
    onError: (error) => console.error("Error creating subcategory:", error),
  });

  const handleAddCategory = () => {
    if (!categoryName) {
      alert("Category name is required.");
      return;
    }
    categoryMutation.mutate({ name: categoryName });
  };

  const handleAddSubcategory = () => {
    if (!selectedCategoryId) {
      alert("Please select a category first.");
      return;
    }
    if (!subcategoryName) {
      alert("Subcategory name is required.");
      return;
    }
    subcategoryMutation.mutate({ name: subcategoryName, category_id: selectedCategoryId });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "card" : "table");
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={toggleViewMode}
            >
              {viewMode === "table" ? (
                <>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Switch to Card
                </>
              ) : (
                <>
                  <Table2 className="mr-2 h-4 w-4" />
                  Switch to Table
                </>
              )}
            </Button>
            <Popover open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <Label>New Category Name</Label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                  <Button
                    onClick={handleAddCategory}
                    className="w-full"
                    disabled={categoryMutation.isPending}
                  >
                    {categoryMutation.isPending ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subcategory
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <Label>New Subcategory Name</Label>
                  <Input
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    placeholder="Enter subcategory name"
                  />
                  <Select
                    value={selectedCategoryId?.toString() || ""}
                    onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddSubcategory}
                    className="w-full"
                    disabled={subcategoryMutation.isPending}
                  >
                    {subcategoryMutation.isPending ? "Adding..." : "Add Subcategory"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {viewMode === "table" ? <ProductTable userId={userId} /> : <ProductCardView userId={userId} />}
      </div>
    </AppLayout>
  );
}