import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Product } from "@/lib/store";

interface ProductDataTableProps {
  products: Product[];
  selectedProductIds?: Set<string>;
  onSelectionChange?: (productIds: Set<string>) => void;
}

const columnHelper = createColumnHelper<Product>();

const ProductDataTable: React.FC<ProductDataTableProps> = ({
  products,
  selectedProductIds,
  onSelectionChange,
}) => {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState([]);

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={selectedProductIds.has(row.original.id)}
            onChange={(e) => {
              const newSelection = new Set(selectedProductIds);
              if (e.target.checked) {
                newSelection.add(row.original.id);
              } else {
                newSelection.delete(row.original.id);
              }
              onSelectionChange(newSelection);
            }}
          />
        ),
        size: 50,
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        ),
      }),

      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <div className="text-gray-900 font-semibold">
            ₹{info.getValue().toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor("stockQuantity", {
        header: "Stock",
        cell: (info) => {
          const stock = info.getValue();
          return (
            <div
              className={`font-medium ${
                stock < 20 ? "text-red-600" : "text-green-600"
              }`}
            >
              {stock} units
            </div>
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className="text-gray-600 text-sm max-w-xs truncate">
            {info.getValue()}
          </div>
        ),
      }),
    ],
    [selectedProductIds, onSelectionChange]
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Selection Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {selectedProductIds.size} of {products.length} products selected
        </span>
        <span>{table.getFilteredRowModel().rows.length} products shown</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      {header.column.getCanSort() && (
                        <span className="flex flex-col">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-gray-400" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getFilteredRowModel().rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default ProductDataTable;
