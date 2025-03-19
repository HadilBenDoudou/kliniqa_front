"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  Columns3,
  Ellipsis,
  Filter,
  LayoutGrid,
  ListFilter,
  Plus,
  Loader2,
  Pencil,
  Trash,
} from "lucide-react";
import { useId, useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory,
  fetchSubcategoriesByCategory,
  fetchProductsBySubcategory,
  updateCategory,
  deleteCategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/services/categorie/categoryService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/lib/services/products/productService";
import Image from "next/image";

// Fonctions de filtrage personnalisées
const multiColumnFilterFn: FilterFn<Product> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.nom}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<Product> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

// Colonnes pour les produits
const productColumns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "nom",
    cell: ({ row }) => <div className="font-medium">{row.getValue("nom")}</div>,
    size: 180,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Reference",
    accessorKey: "ref",
    size: 120,
  },
  {
    header: "Price",
    accessorKey: "prix",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("prix") || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return formatted;
    },
    size: 120,
  },
  {
    header: "Stock",
    accessorKey: "qt_stock",
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "en_stock",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.getValue("en_stock") === false && "bg-muted-foreground/60 text-primary-foreground",
          row.getValue("en_stock") === true && "bg-black text-white"
        )}
      >
        {row.getValue("en_stock") ? "In Stock" : "Out of Stock"}
      </Badge>
    ),
    size: 120,
    filterFn: statusFilterFn,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-24">
    <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
  </div>
);

// Composant d'image placeholder
const PlaceholderImage = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
    <Image
      src="/loading/Loading-rafiki.svg"
      alt="Select a subcategory"
      width={300}
      height={300}
      className="object-contain"
    />
  </div>
);

export default function CategoriesPage() {
  const id = useId();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "nom", desc: false }]);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = 1; // Remplacez par l'ID utilisateur réel depuis le contexte d'authentification

  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: subcategories = [], isLoading: isSubcategoriesLoading, error: subcategoriesError } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: () => fetchSubcategoriesByCategory(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: products = [], isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ["products", selectedSubcategoryId],
    queryFn: () => fetchProductsBySubcategory(selectedSubcategoryId!),
    enabled: !!selectedSubcategoryId,
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryName("");
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to create category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategoryId(null);
      setEditCategoryName("");
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (selectedCategoryId === editingCategoryId) {
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
      }
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to delete category");
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: updateSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories", selectedCategoryId] });
      setEditingSubcategoryId(null);
      setEditSubcategoryName("");
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to update subcategory");
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories", selectedCategoryId] });
      if (selectedSubcategoryId === editingSubcategoryId) {
        setSelectedSubcategoryId(null);
      }
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to delete subcategory");
    },
  });

  const productTable = useReactTable({
    data: products,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: { sorting, pagination, columnFilters, columnVisibility },
  });

  useEffect(() => {
    if (products.length > 0) {
      productTable.setPageIndex(0);
    }
  }, [products]);

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }
    createCategoryMutation.mutate({ name: categoryName });
  };

  const handleEditCategory = (categoryId: number, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditCategoryName(currentName);
    setErrorMessage(null);
  };

  const handleUpdateCategory = (categoryId: number) => {
    if (!editCategoryName.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }
    updateCategoryMutation.mutate({ userId, id: categoryId, name: editCategoryName });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate({ userId, id: categoryId });
    }
  };

  const handleEditSubcategory = (subcategoryId: number, currentName: string) => {
    setEditingSubcategoryId(subcategoryId);
    setEditSubcategoryName(currentName);
    setErrorMessage(null);
  };

  const handleUpdateSubcategory = (subcategoryId: number) => {
    if (!editSubcategoryName.trim()) {
      setErrorMessage("Subcategory name cannot be empty.");
      return;
    }
    updateSubcategoryMutation.mutate({ userId, id: subcategoryId, name: editSubcategoryName });
  };

  const handleDeleteSubcategory = (subcategoryId: number) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      deleteSubcategoryMutation.mutate({ userId, id: subcategoryId });
    }
  };

  const uniqueStatusValues = useMemo(() => {
    return [...new Set(products.map((p) => (p.en_stock ? "In Stock" : "Out of Stock")))];
  }, [products]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const status = p.en_stock ? "In Stock" : "Out of Stock";
      counts.set(status, (counts.get(status) || 0) + 1);
    });
    return counts;
  }, [products]);

  const selectedStatuses = useMemo(() => {
    const filterValue = productTable.getColumn("en_stock")?.getFilterValue() as string[] | undefined;
    return filterValue ?? [];
  }, [productTable]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = productTable.getColumn("en_stock")?.getFilterValue() as string[] | undefined;
    const newFilterValue = filterValue ? [...filterValue] : [];
    const boolValue = value === "In Stock";

    if (checked) {
      newFilterValue.push(boolValue.toString());
    } else {
      const index = newFilterValue.indexOf(boolValue.toString());
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    productTable.getColumn("en_stock")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h3 className="text-lg font-semibold mb-4 text-black">Categories</h3>
        {isCategoriesLoading ? (
          <LoadingSpinner />
        ) : categoriesError ? (
          <p className="text-red-500">Error: {(categoriesError as Error).message}</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                {editingCategoryId === category.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Edit category name"
                      className="w-full"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateCategory(category.id)}
                      disabled={updateCategoryMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategoryId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setSelectedSubcategoryId(null);
                        setErrorMessage(null);
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded flex items-center gap-2 transition-colors duration-200",
                        selectedCategoryId === category.id
                          ? "bg-gray-900 text-white"
                          : "text-black hover:bg-gray-200"
                      )}
                    >
                    <img
  src="/loading/play-svgrepo-com.svg"
  alt="Play icon"
  className={cn(
    "h-4 w-4",
    selectedCategoryId === category.id ? "text-white" : "text-black"
  )}
/>
                      {category.name}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Ellipsis size={16} strokeWidth={2} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCategory(category.id, category.name)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                {selectedCategoryId === category.id && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {isSubcategoriesLoading ? (
                      <li>
                        <LoadingSpinner />
                      </li>
                    ) : subcategoriesError ? (
                      <li className="text-red-500 text-sm">Error: {(subcategoriesError as Error).message}</li>
                    ) : subcategories.length > 0 ? (
                      subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          {editingSubcategoryId === subcategory.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editSubcategoryName}
                                onChange={(e) => setEditSubcategoryName(e.target.value)}
                                placeholder="Edit subcategory name"
                                className="w-full"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateSubcategory(subcategory.id)}
                                disabled={updateSubcategoryMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSubcategoryId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setSelectedSubcategoryId(subcategory.id);
                                  setErrorMessage(null);
                                }}
                                className={cn(
                                  "w-full text-left p-2 rounded flex items-center gap-2 transition-colors duration-200",
                                  selectedSubcategoryId === subcategory.id
                                    ? "bg-gray-800 text-white"
                                    : "text-black hover:bg-gray-300"
                                )}
                              >
                                <img
  src="/loading/play-svgrepo-com.svg"
  alt="Play icon"
  className={cn(
    "h-4 w-4",
    selectedCategoryId === category.id ? "text-white" : "text-black"
  )}
/>
                                {subcategory.name}
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Ellipsis size={16} strokeWidth={2} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditSubcategory(subcategory.id, subcategory.name)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No subcategories available.</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-8 max-w-[1000px] mx-auto">
        <div className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className={cn(
                    "peer min-w-60 ps-9",
                    Boolean(productTable.getColumn("nom")?.getFilterValue()) && "pe-9"
                  )}
                  value={(productTable.getColumn("nom")?.getFilterValue() ?? "") as string}
                  onChange={(e) => productTable.getColumn("nom")?.setFilterValue(e.target.value)}
                  placeholder="Filter by product name..."
                  disabled={!selectedSubcategoryId}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <ListFilter size={16} strokeWidth={2} />
                </div>
                {Boolean(productTable.getColumn("nom")?.getFilterValue()) && (
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 hover:text-foreground"
                    onClick={() => {
                      productTable.getColumn("nom")?.setFilterValue("");
                      inputRef.current?.focus();
                    }}
                  >
                    <CircleX size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={!selectedSubcategoryId}>
                    <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                    Status
                    {selectedStatuses.length > 0 && (
                      <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border border-border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                        {selectedStatuses.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-36 p-3" align="start">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">Filters</div>
                    <div className="space-y-3">
                      {uniqueStatusValues.map((value, i) => (
                        <div key={value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${id}-${i}`}
                            checked={selectedStatuses.includes(value === "In Stock" ? "true" : "false")}
                            onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                          />
                          <Label htmlFor={`${id}-${i}`} className="flex grow justify-between gap-2 font-normal">
                            {value}
                            <span className="ms-2 text-xs text-muted-foreground">
                              {statusCounts.get(value) || 0}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Columns3 className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {productTable.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
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
                    <Button onClick={handleAddCategory} className="w-full" disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Section des produits ou placeholder */}
          {selectedSubcategoryId ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              {isProductsLoading ? (
                <LoadingSpinner />
              ) : productsError ? (
                <p className="text-red-500">Error: {(productsError as Error).message}</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border bg-background">
                    <Table className="table-fixed">
                      <TableHeader>
                        {productTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} style={{ width: `${header.getSize()}px` }} className="h-11">
                                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                  <div
                                    className="flex cursor-pointer select-none items-center justify-between gap-2"
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                      asc: <ChevronUp className="shrink-0 opacity-60" size={16} />,
                                      desc: <ChevronDown className="shrink-0 opacity-60" size={16} />,
                                    }[header.column.getIsSorted() as string] ?? null}
                                  </div>
                                ) : (
                                  flexRender(header.column.columnDef.header, header.getContext())
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {productTable.getRowModel().rows?.length ? (
                          productTable.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="last:py-0">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={productColumns.length} className="h-24 text-center">
                              No products available for this subcategory.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                      <Label htmlFor={id} className="whitespace-nowrap">Rows per page</Label>
                      <Select
                        value={productTable.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => productTable.setPageSize(Number(value))}
                      >
                        <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 25].map((pageSize) => (
                            <SelectItem key={pageSize} value={pageSize.toString()}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Pagination className="flex items-center gap-3">
                      <div className="flex grow justify-end text-sm text-muted-foreground whitespace-nowrap">
                        {productTable.getState().pagination.pageIndex * productTable.getState().pagination.pageSize + 1}-
                        {Math.min(
                          (productTable.getState().pagination.pageIndex + 1) * productTable.getState().pagination.pageSize,
                          productTable.getRowCount()
                        )}{" "}
                        of {productTable.getRowCount()}
                      </div>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => productTable.firstPage()}
                            disabled={!productTable.getCanPreviousPage()}
                          >
                            <ChevronFirst size={16} strokeWidth={2} />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => productTable.previousPage()}
                            disabled={!productTable.getCanPreviousPage()}
                          >
                            <ChevronLeft size={16} strokeWidth={2} />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => productTable.nextPage()}
                            disabled={!productTable.getCanNextPage()}
                          >
                            <ChevronRight size={16} strokeWidth={2} />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => productTable.lastPage()}
                            disabled={!productTable.getCanNextPage()}
                          >
                            <ChevronLast size={16} strokeWidth={2} />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <PlaceholderImage />
          )}
        </div>
      </div>
    </div>
  );
}

function RowActions({ row }: { row: Row<Product> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit product">
            <Ellipsis size={16} strokeWidth={2} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Duplicate</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}