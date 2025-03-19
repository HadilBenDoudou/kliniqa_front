"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { fetchProducts, Product } from "@/lib/services/products/productService";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  VisibilityState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedUniqueValues,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  Filter,
  Columns3,
  Ellipsis,
  ListFilter,
  CircleX,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

// Custom filter functions
const multiColumnFilterFn: FilterFn<Product> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.nom} ${row.original.prix} ${row.original.ref} ${row.original.brand || ""}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<Product> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) ? "In Stock" : "Out of Stock";
  return filterValue.includes(status);
};

// Column definitions
const columns: ColumnDef<Product>[] = [
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
    header: "Price",
    accessorKey: "prix",
    cell: ({ row }) => `TND${row.getValue("prix")}`,
    size: 120,
    enableSorting: true,
  },
  {
    header: "Images",
    accessorKey: "image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string;
      return image ? (
        <img src={image} alt={row.getValue("nom")} className="h-10 w-10 object-cover rounded" />
      ) : (
        <span className="text-muted-foreground">No image</span>
      );
    },
    size: 150,
    enableSorting: false,
  },
  {
    header: "Stock",
    accessorKey: "en_stock",
    cell: ({ row }) => (
      <Badge
        className={cn(
          !row.getValue("en_stock") && "bg-muted-foreground/60 text-primary-foreground"
        )}
      >
        {row.getValue("en_stock") ? "In Stock" : "Out of Stock"}
      </Badge>
    ),
    size: 100,
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

// RowActions component
function RowActions({ row }: { row: Row<Product> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit product">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
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

const loadingBox = {
  width: 20,
  height: 20,
  backgroundColor: "#2d2dc1",
  borderRadius: 5,
};

export default function ProductTable({ userId }: { userId: number | null }) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ["products", userId],
    queryFn: () => fetchProducts(userId!),
    enabled: !!userId,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: "nom", desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableSortingRemoval: false,
    state: {
      columnFilters,
      columnVisibility,
      sorting,
      pagination,
    },
  });

  const uniqueStatusValues = ["In Stock", "Out of Stock"];
  const statusCounts = new Map<string, number>([
    ["In Stock", products.filter(p => p.en_stock).length],
    ["Out of Stock", products.filter(p => !p.en_stock).length],
  ]);
  const selectedStatuses = (table.getColumn("en_stock")?.getFilterValue() as string[]) ?? [];

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("en_stock")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];
    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) newFilterValue.splice(index, 1);
    }
    table.getColumn("en_stock")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  if (isProductsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 180, 180, 0],
            borderRadius: ["0%", "0%", "50%", "50%", "0%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={loadingBox}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1000px]">
      {productsError ? (
        <div>Error loading products: {(productsError as Error).message}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  ref={nameInputRef}
                  className={cn(
                    "peer min-w-60 ps-9",
                    Boolean(table.getColumn("nom")?.getFilterValue()) && "pe-9"
                  )}
                  value={(table.getColumn("nom")?.getFilterValue() ?? "") as string}
                  onChange={(e) => table.getColumn("nom")?.setFilterValue(e.target.value)}
                  placeholder="Filter by name, price, ref, or brand..."
                  aria-label="Filter by name, price, reference, or brand"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                {Boolean(table.getColumn("nom")?.getFilterValue()) && (
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
                    aria-label="Clear filter"
                    onClick={() => {
                      table.getColumn("nom")?.setFilterValue("");
                      nameInputRef.current?.focus();
                    }}
                  >
                    <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                    Stock Status
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
                            id={`status-${i}`}
                            checked={selectedStatuses.includes(value)}
                            onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                          />
                          <Label htmlFor={`status-${i}`} className="flex grow justify-between gap-2 font-normal">
                            {value}
                            <span className="ms-2 text-xs text-muted-foreground">
                              {statusCounts.get(value)}
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
                    <Columns3 className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
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
            <Link href="/admin/pharmacien/products/add-product">
              <Button variant="outline">
                <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                Add Product
              </Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <Table className="table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={0}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ChevronUp className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
                              desc: <ChevronDown className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Label className="whitespace-nowrap">Rows per page</Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-fit whitespace-nowrap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination className="flex items-center gap-3">
              <div className="flex grow justify-end text-sm text-muted-foreground whitespace-nowrap">
                <p aria-live="polite">
                  <span className="text-foreground">
                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getRowCount()
                    )}
                  </span>{" "}
                  of <span className="text-foreground">{table.getRowCount()}</span>
                </p>
              </div>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronFirst size={16} strokeWidth={2} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={16} strokeWidth={2} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLast size={16} strokeWidth={2} />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}