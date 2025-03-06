"use client";

import React, { useState, useRef, useMemo, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { fetchUsers } from "../../../../lib/services/Admin_pharmacie/userService";
import { parsePhoneNumberFromString } from "libphonenumber-js"; // Import the library
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CircleAlert,
  CircleX,
  Columns3,
  Ellipsis,
  Filter,
  ListFilter,
  Plus,
  Trash,
} from "lucide-react";

// Define the User type based on utilisateur schema
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  role: string;
  created_at: string;
  updated_at: string | null;
  status?: "Active" | "Inactive" | "Pending";
};

// Function to get flag emoji from phone number using libphonenumber-js
const getFlagFromPhone = (phone: string): string => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  if (phoneNumber && phoneNumber.country) {
    const countryCode = phoneNumber.country;
    // Convert ISO 3166-1 alpha-2 code to flag emoji
    return countryCode
      .split("")
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join("");
  }
  return "🌐"; // Default to globe if parsing fails
};

// Custom filter functions
const multiColumnFilterFn: FilterFn<User> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.name} ${row.original.email}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<User> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

// Define columns for the users table
const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    size: 150,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 200,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{getFlagFromPhone(row.getValue("phone") as string)}</span>
        <span>{row.getValue("phone")}</span>
      </div>
    ),
    size: 150,
  },
  {
    header: "Image",
    accessorKey: "image",
    cell: ({ row }) => (
      row.getValue("image") ? (
        <img
          src={row.getValue("image") as string}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <span className="text-muted-foreground">N/A</span>
      )
    ),
    size: 80,
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => <Badge>{row.getValue("role")}</Badge>,
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.getValue("status") === "Inactive" && "bg-muted-foreground/60 text-primary-foreground",
        )}
      >
        {row.getValue("status") || "N/A"}
      </Badge>
    ),
    size: 100,
    filterFn: statusFilterFn,
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => new Date(row.getValue("created_at") as string).toLocaleDateString(),
    size: 120,
  },
  {
    header: "Updated At",
    accessorKey: "updated_at",
    cell: ({ row }) =>
      row.getValue("updated_at")
        ? new Date(row.getValue("updated_at") as string).toLocaleDateString()
        : "N/A",
    size: 120,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
];

export default function StaticTablePage() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  // Fetch users dynamically with TanStack Query
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const fetchedUsers = await fetchUsers();
      return fetchedUsers.map((user) => ({
        id: user.id.toString(),
        name: `${user.nom} ${user.prenom}`,
        email: user.email,
        phone: user.telephone,
        image: user.image || null,
        role: user.role,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || null,
        status: user.status || "Active",
      }));
    },
  });

  const [data, setData] = useState<User[]>(users);

  // Update local data when fetched data changes
  React.useEffect(() => {
    if (!isLoading && !error) {
      setData(users);
    }
  }, [users, isLoading, error]);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id),
    );
    setData(updatedData);
    table.resetRowSelection();
  };

  const table = useReactTable({
    data,
    columns,
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
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const uniqueStatusValues = useMemo(() => {
    const statusColumn = table.getColumn("status");
    return statusColumn ? Array.from(statusColumn.getFacetedUniqueValues().keys()).sort() : [];
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("status");
    return statusColumn ? statusColumn.getFacetedUniqueValues() : new Map();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("status")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold">Pharmacists</h1>
        <div className="text-center">Loading...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold">Pharmacists</h1>
        <div className="text-center text-red-500">Error: {(error as Error).message}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Pharmacists</h1>
      <div className="space-y-4 max-w-[1000px]">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9",
                  Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9",
                )}
                value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
                onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                placeholder="Filter by name or email..."
                type="text"
                aria-label="Filter by name or email"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("name")?.getFilterValue()) && (
                <button
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn("name")?.setFilterValue("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
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
                  Status
                  {selectedStatuses.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
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
                          checked={selectedStatuses.includes(value)}
                          onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
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
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
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
            {table.getSelectedRowModel().rows.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="ml-auto" variant="outline">
                    <Trash className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                    Delete
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {table.getSelectedRowModel().rows.length}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                      <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete{" "}
                        {table.getSelectedRowModel().rows.length} selected{" "}
                        {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRows}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button className="ml-auto" variant="outline">
              <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
              Add pharmacist
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-background">
          <Table className="w-full">
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
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
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

        {/* Pagination */}
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
            <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
              <span className="text-foreground">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0,
                  ),
                  table.getRowCount(),
                )}
              </span>{" "}
              of <span className="text-foreground">{table.getRowCount().toString()}</span>
            </p>
          </div>
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function RowActions({ row }: { row: Row<User> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Duplicate</span>
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Archive</span>
            <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Move to project</DropdownMenuItem>
              <DropdownMenuItem>Move to folder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Advanced options</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Add to favorites</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <span>Delete</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}