"use client";
import AppLayout from "@/components/ui/pharmacien/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
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
  ListFilter,
  Plus,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubcategories,
  createSubcategory,
  Subcategory,
  fetchCategories,
  Category,
} from "@/lib/services/categorie/categoryService";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nameFilterFn = <T extends { name: string }>(
  row: Row<T>,
  columnId: string,
  filterValue: any
): boolean => {
  const searchableRowContent = `${row.original.name}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const subcategoryColumns: ColumnDef<Subcategory>[] = [
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
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    size: 180,
    filterFn: nameFilterFn,
    enableHiding: false,
  },
  {
    header: "Category ID",
    accessorKey: "category_id",
    size: 120,
  },
  {
    header: "ID",
    accessorKey: "id",
    size: 120,
  },
];

export default function SubcategoriesPage() {
  const id = useId();
  const queryClient = useQueryClient();
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

  const { data: subcategories = [], isLoading: subLoading, error: subError } = useQuery<Subcategory[], Error>({
    queryKey: ["subcategories"],
    queryFn: () => fetchSubcategories(),
  });

  const { data: categories = [] } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setSubcategoryName("");
      setSelectedCategoryId(undefined);
    },
    onError: (error) => console.error("Error creating subcategory:", error),
  });

  const table = useReactTable({
    data: subcategories,
    columns: subcategoryColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, pagination, columnFilters, columnVisibility },
  });

  const handleAddSubcategory = () => {
    if (!selectedCategoryId) {
      alert("Please select a category first.");
      return;
    }
    if (!subcategoryName) {
      alert("Subcategory name is required.");
      return;
    }
    mutation.mutate({ name: subcategoryName, category_id: selectedCategoryId });
  };

  return (
    <div className="mt-8 max-w-[1000px] mx-auto">
      <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
      {subLoading ? (
        <p>Loading subcategories...</p>
      ) : subError ? (
        <p className="text-red-500">Error: {subError.message}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className={cn("peer min-w-60 ps-9", Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9")}
                  value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
                  onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                  placeholder="Filter by name..."
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                  <ListFilter size={16} strokeWidth={2} />
                </div>
                {Boolean(table.getColumn("name")?.getFilterValue()) && (
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 hover:text-foreground"
                    onClick={() => {
                      table.getColumn("name")?.setFilterValue("");
                      inputRef.current?.focus();
                    }}
                  >
                    <CircleX size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Columns3 className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
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
                  <Button onClick={handleAddSubcategory} className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Adding..." : "Add Subcategory"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <Table className="table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center gap-2"
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn("even:bg-gray-50 odd:bg-white", row.getIsSelected() && "bg-blue-100")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="bg-white">
                    <TableCell colSpan={subcategoryColumns.length} className="h-24 text-center">
                      No subcategories available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Label htmlFor={id} className="whitespace-nowrap">
                Rows per page
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger id={id} className="w-fit">
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
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getRowCount()
                )}{" "}
                of {table.getRowCount()}
              </div>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
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
  );
}