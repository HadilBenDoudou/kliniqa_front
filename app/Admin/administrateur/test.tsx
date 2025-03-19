"use client";

import React, { useState, useRef, useMemo, useId, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { parsePhoneNumberFromString } from "libphonenumber-js";
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
  Table as TableType,
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
  TableMeta,
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
  ListFilter,
  Plus,
  Trash,
} from "lucide-react";
import AlertModal from "@/components/AlertModal";
import { deactivateUser, deleteUser, fetchPharmacien } from "@/lib/services/profile/userservice";
import { motion } from "framer-motion";
import AppLayout from "@/components/ui/administrateur/AppLayout";
import { fetchUsers } from "@/lib/services/Admin_pharmacie/userService";

// Define the User type
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  role: string;
  created_at: string;
  updated_at: string | null;
  status: "Active" | "Inactive";
};

// Define CustomTableMeta to extend TableMeta
interface CustomTableMeta<TData> {
  setData?: React.Dispatch<React.SetStateAction<TData[]>>;
}

// Helper function to get flag emoji from phone number
const getFlagFromPhone = (phone: string): string => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  if (phoneNumber && phoneNumber.country) {
    const countryCode = phoneNumber.country;
    return countryCode
      .split("")
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join("");
  }
  return "🌐";
};

// Multi-column filter function
const multiColumnFilterFn: FilterFn<User> = (
  row: Row<User>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value.toLowerCase().includes(filterValue.toLowerCase());
};

// Status filter function
const statusFilterFn: FilterFn<User> = (
  row: Row<User>,
  columnId: string,
  filterValue: string[]
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

// Define columns
const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="custom-checkbox border-2 rounded"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="custom-checkbox border-2 rounded"
      />
    ),
    size: 20,
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
    size: 180,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span>{getFlagFromPhone(row.getValue("phone") as string)}</span>
        <span>{row.getValue("phone")}</span>
      </div>
    ),
    size: 130,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Image",
    accessorKey: "image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string | null;
      const email = row.getValue("email") as string;
      const name = row.getValue("name") as string;

      if (image) {
        return (
          <>
            <img
              src={image}
              alt={name || "User"}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
              }}
              onLoad={(e) => {
                e.currentTarget.style.display = "block";
                (e.currentTarget.nextSibling as HTMLElement).style.display = "none";
              }}
            />
            {(() => {
              const emailParts = email.split("@");
              const abbreviation =
                emailParts.length === 2 && emailParts[0] && emailParts[1]
                  ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
                  : email.length >= 2
                    ? email.slice(0, 2).toUpperCase()
                    : "??";
              return (
                <div
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium"
                  style={{ display: "none" }}
                >
                  {abbreviation}
                </div>
              );
            })()}
          </>
        );
      } else {
        const emailParts = email.split("@");
        const abbreviation =
          emailParts.length === 2 && emailParts[0] && emailParts[1]
            ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
            : email.length >= 2
              ? email.slice(0, 2).toUpperCase()
              : "??";

        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
            {abbreviation}
          </div>
        );
      }
    },
    size: 60,
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => (
      <Badge style={{ backgroundColor: "#2d2dc1", color: "white" }}>
        {row.getValue("role")}
      </Badge>
    ),
    size: 80,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.getValue("status") === "Active" && "bg-gray-500 text-white",
          row.getValue("status") === "Inactive" && "bg-red-500 text-white"
        )}
      >
        {row.getValue("status") || "N/A"}
      </Badge>
    ),
    size: 80,
    filterFn: statusFilterFn,
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) =>
      new Date(row.getValue("created_at") as string).toLocaleDateString(),
    size: 100,
  },
  {
    header: "Updated At",
    accessorKey: "updated_at",
    cell: ({ row }) =>
      row.getValue("updated_at")
        ? new Date(row.getValue("updated_at") as string).toLocaleDateString()
        : "N/A",
    size: 100,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => (
      <RowActions row={row} setData={(table as any).meta?.setData} />
    ),
    size: 50,
    enableSorting: false,
    enableHiding: false,
  },
];

const box = {
  width: 20,
  height: 20,
  backgroundColor: "#2d2dc1",
  borderRadius: 5,
};

export default function StaticTablePage() {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Get initial page and status from URL
  const initialPage = useMemo(() => {
    const pageFromUrl = searchParams.get("page");
    return pageFromUrl ? parseInt(pageFromUrl, 10) - 1 : 0;
  }, [searchParams]);

  const initialStatusFilter = useMemo(() => {
    const statusFromUrl = searchParams.get("status");
    return statusFromUrl ? statusFromUrl.split(",") : [];
  }, [searchParams]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage,
    pageSize: 10,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);
  const [selectedRowsToDelete, setSelectedRowsToDelete] = useState<Row<User>[]>([]);
  const [filterType, setFilterType] = useState<"name" | "email" | "phone">("name");

  const { data: allUsers = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const fetchedUsers = await fetchUsers();
      const usersWithStatus = await Promise.all(
        fetchedUsers.map(async (user) => {
          let status: "Active" | "Inactive" = "Inactive";
          try {
            const userId = parseInt(user.id.toString(), 10);
            if (isNaN(userId) || userId <= 0) {
              console.warn(`Skipping invalid userId: ${user.id}`);
            } else {
              const pharmacien = await fetchPharmacien(userId);
              status = pharmacien.etat ? "Active" : "Inactive";
            }
          } catch (err) {
            console.error(`Failed to fetch pharmacist data for user ${user.id}:`, err);
          }
          return {
            id: user.id.toString(),
            name: `${user.nom} ${user.prenom}`,
            email: user.email,
            phone: user.telephone,
            image: user.image || null,
            role: user.role,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || null,
            status,
          };
        })
      );
      return usersWithStatus;
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      await Promise.all(userIds.map((id) => deleteUser(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      setIsDeleteConfirmOpen(false);
      setIsDeleteSuccessOpen(true);
      table.resetRowSelection();
    },
    onError: (err) => {
      console.error("Error deleting users:", err);
      alert("Failed to delete users: " + (err instanceof Error ? err.message : "Unknown error"));
    },
  });

  const [data, setData] = useState<User[]>(allUsers);

  useEffect(() => {
    if (!isLoading && !error) {
      setData(allUsers);
    }
  }, [allUsers, isLoading, error]);

  const handleDeleteRows = (rows: Row<User>[]) => {
    setSelectedRowsToDelete(rows);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    const userIds = selectedRowsToDelete.map((row) => parseInt(row.original.id, 10));
    deleteMutation.mutate(userIds);
  };

  const table = useReactTable<User>({
    data,
    columns, // Fixed: Use columns instead of Columns3
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
    meta: {
      setData,
    } as CustomTableMeta<User>,
    initialState: {
      columnFilters: initialStatusFilter.length
        ? [{ id: "status", value: initialStatusFilter }]
        : [],
      pagination: { pageIndex: initialPage, pageSize: 10 },
    },
  });

  // Sync pagination and filters with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (pagination.pageIndex + 1).toString());
    const statusFilter = table.getColumn("status")?.getFilterValue() as string[] | undefined;
    if (statusFilter && statusFilter.length > 0) {
      params.set("status", statusFilter.join(","));
    } else {
      params.delete("status");
    }
    const filterValue = table.getColumn(filterType)?.getFilterValue() as string | undefined;
    if (filterValue) {
      params.set(filterType, filterValue);
    } else {
      params.delete(filterType);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [
    pagination,
    filterType,
    table.getColumn(filterType)?.getFilterValue(),
    table.getColumn("status")?.getFilterValue(),
    router,
    searchParams,
  ]);

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("status");
    return statusColumn ? statusColumn.getFacetedUniqueValues() : new Map();
  }, [table]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[] | undefined;
    return filterValue ?? [];
  }, [table]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[] | undefined;
    let newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      newFilterValue = newFilterValue.filter((v) => v !== value);
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length > 0 ? newFilterValue : undefined);
  };

  const handleClearStatuses = () => {
    table.getColumn("status")?.setFilterValue(undefined);
  };

  const handleFilterChange = (value: string) => {
    table.getColumn(filterType)?.setFilterValue(value);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold mb-4">Pharmacists</h1>
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
            style={box}
          />
        </div>
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
      <h1 className="text-2xl font-bold mb-4">Pharmacists</h1>
      <div className="space-y-4 w-full max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Select
                value={filterType}
                onValueChange={(value: "name" | "email" | "phone") => {
                  setFilterType(value);
                  table.getColumn(filterType)?.setFilterValue("");
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className={cn(
                    "peer min-w-60 ps-9",
                    Boolean(table.getColumn(filterType)?.getFilterValue()) && "pe-9"
                  )}
                  value={(table.getColumn(filterType)?.getFilterValue() as string) ?? ""}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  placeholder={`Filter by ${filterType}...`}
                  type="text"
                  aria-label={`Filter by ${filterType}`}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                {Boolean(table.getColumn(filterType)?.getFilterValue()) && (
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Clear filter"
                    onClick={() => {
                      table.getColumn(filterType)?.setFilterValue("");
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                  >
                    <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(selectedStatuses.length > 0 && "border-blue-500")}
                >
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Status
                  {selectedStatuses.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 items-center rounded bg-blue-100 px-1 text-[0.625rem] font-medium text-blue-800">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-muted-foreground">Status Filters</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearStatuses}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {statusOptions.map((option, i) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedStatuses.includes(option.value)}
                          onCheckedChange={(checked: boolean) =>
                            handleStatusChange(checked, option.value)
                          }
                          className={cn(
                            "custom-checkbox border-2 rounded",
                            selectedStatuses.includes(option.value)
                              ? "border-blue-600"
                              : "border-gray-300"
                          )}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal text-sm"
                        >
                          {option.label}
                          <span className="ms-2 text-xs text-muted-foreground">
                            {statusCounts.get(option.value) || 0}
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
                  <Columns3
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
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
              <Button
                className="ml-auto"
                variant="outline"
                onClick={() => handleDeleteRows(table.getSelectedRowModel().rows)}
              >
                <Trash
                  className="-ms-1 me-2 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Delete
                <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  {table.getSelectedRowModel().rows.length}
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background overflow-x-auto">
          <TableType className="w-full table-auto">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.column.getSize() === 0 ? "auto" : `${header.getSize()}px`,
                      }}
                      className="h-12 text-sm font-semibold text-gray-700"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            "flex h-full cursor-pointer select-none items-center justify-between gap-2"
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-14"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    No pharmacists found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableType>
        </div>

        <AlertModal
          open={isDeleteConfirmOpen}
          type="error"
          message={`Are you sure you want to delete ${selectedRowsToDelete.length} selected row${selectedRowsToDelete.length > 1 ? "s" : ""}? This action cannot be undone.`}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
        />

        <AlertModal
          open={isDeleteSuccessOpen}
          type="success"
          message={`Successfully deleted ${selectedRowsToDelete.length} row${selectedRowsToDelete.length > 1 ? "s" : ""}.`}
          onClose={() => setIsDeleteSuccessOpen(false)}
        />

        <div className="flex items-center justify-between gap-8 mt-4">
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
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
                    0
                  ),
                  table.getRowCount()
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

function RowActions({ row, setData }: { row: Row<User>; setData?: React.Dispatch<React.SetStateAction<User[]>> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSingleDeleteConfirmOpen, setIsSingleDeleteConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log("Attempting to delete user with ID:", userId);
      const response = await deleteUser(userId);
      console.log("Delete response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Single deletion successful");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsSingleDeleteConfirmOpen(false);
    },
    onError: (err) => {
      console.error("Error deleting user:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to delete user: ${errorMessage}`);
      setIsSingleDeleteConfirmOpen(false);
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log("Attempting to block user with ID:", userId);
      await deactivateUser(userId);
    },
    onSuccess: () => {
      console.log("User blocked successfully");

      // Update the query cache immediately
      queryClient.setQueryData<User[]>(["users"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((user) =>
          user.id === row.original.id ? { ...user, status: "Inactive" } : user
        );
      });

      // Update local data state if setData is provided
      if (setData) {
        setData((prevData) =>
          prevData.map((user) =>
            user.id === row.original.id ? { ...user, status: "Inactive" } : user
          )
        );
      }

      // Background refetch to ensure server sync
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsBlockConfirmOpen(false);
    },
    onError: (err) => {
      console.error("Error blocking user:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to block user: ${errorMessage}`);
      setIsBlockConfirmOpen(false);
    },
  });

  const handleViewDetails = (userId: string) => {
    router.push(`/admin/administrateur/pharmacie-user/pharmacists/${userId}`);
  };

  const handleSingleDelete = () => {
    console.log("Single row selected for deletion:", row.original.id);
    setIsSingleDeleteConfirmOpen(true);
  };

  const confirmSingleDelete = () => {
    console.log("Confirming single deletion for row:", row);
    const userId = parseInt(row.original.id, 10);
    if (isNaN(userId)) {
      console.error("Invalid userId:", row.original.id);
      alert("Invalid user ID. Please try again.");
      setIsSingleDeleteConfirmOpen(false);
      return;
    }
    deleteMutation.mutate(userId);
  };

  const handleBlock = () => {
    console.log("Single row selected for blocking:", row.original.id);
    setIsBlockConfirmOpen(true);
  };

  const confirmBlock = () => {
    console.log("Confirming block for row:", row);
    const userId = parseInt(row.original.id, 10);
    if (isNaN(userId)) {
      console.error("Invalid userId:", row.original.id);
      alert("Invalid user ID. Please try again.");
      setIsBlockConfirmOpen(false);
      return;
    }
    blockMutation.mutate(userId);
  };

  return (
    <>
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
            <DropdownMenuItem onClick={() => handleViewDetails(row.original.id)}>
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBlock}>
              <span>Bloquer</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleSingleDelete}
          >
            <span>Delete</span>
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertModal
        open={isSingleDeleteConfirmOpen}
        type="error"
        message={`Are you sure you want to delete ${row.original.name}? This action cannot be undone.`}
        onClose={() => setIsSingleDeleteConfirmOpen(false)}
        onConfirm={confirmSingleDelete}
      />

      <AlertModal
        open={isBlockConfirmOpen}
        type="warning"
        message={`Are you sure you want to block ${row.original.name}? This will deactivate their account.`}
        onClose={() => setIsBlockConfirmOpen(false)}
        onConfirm={confirmBlock}
      />
    </>
  );
}