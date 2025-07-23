"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { Saletype, useInventoryStore } from "@/lib/store";
import { EditSaleDialog } from "@/components/edit-sale-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SaleItem } from "@prisma/client";

export default function ClientSideSalesComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<Saletype | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  const sales = useInventoryStore((state) => state.sales);
  const products = useInventoryStore((state) => state.products);
  const deleteSale = useInventoryStore((state) => state.deleteSale);

  // Create a product lookup map for better performance
  const productMap = new Map(products.map((product) => [product.id, product]));

  const filteredSales = sales
    .filter(
      (sale) =>
        sale?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale?.customer?.phone.toString().includes(searchTerm)
    )
    .sort(
      (a, b) =>
        new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime()
    );

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("api/sale/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("deleted");
      } else {
        toast.error("failed");
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    }
    deleteSale(id);
    setDeletingSaleId(null);
  };

  // Helper function to render purchased products with quantities
  const renderPurchasedProducts = (saleItems: SaleItem[]) => {
    if (!saleItems || saleItems.length === 0) {
      return <span className="text-gray-500 text-sm">No items</span>;
    }

    return (
      <div className="space-y-1">
        {saleItems.map((item, index) => {
          const product = productMap.get(item.productId);
          return (
            <React.Fragment key={`${item.productId}-${index}`}>
              <div className="text-sm px-2 py-1">
                <span className="font-medium">
                  {product?.name || "Unknown Product"}
                </span>
                <span className="ml-2 text-gray-600">x{item.quantity}</span>
              </div>
              {index < saleItems.length - 1 && <Separator className="mx-1" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-h-screen overflow-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
        Sales History
      </h1>
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All Sales Records</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Search by customer name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View */}
          <div className="block lg:hidden">
            {filteredSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500 px-4">
                {searchTerm
                  ? "No sales found matching your search."
                  : "No sales recorded yet."}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {filteredSales.map((sale) => (
                  <Card key={sale.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-lg truncate">
                              {sale?.customer?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {sale?.customer?.phone}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(sale.salesDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              sale.paymentStatus === "PAID"
                                ? "default"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {sale.paymentStatus}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Amount:</span>
                            <p className="font-medium">
                              ₹{sale.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Amount Paid:</span>
                            <p className="font-medium">
                              ₹{sale.amountPaid.toFixed(2)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Payment Mode:</span>
                            <p className="font-medium capitalize">
                              {sale.paymentMethod}
                            </p>
                          </div>
                        </div>

                        {/* Products section for mobile */}
                        <div>
                          <span className="text-gray-500 text-sm">
                            Products:
                          </span>
                          <div className="mt-1 p-2 bg-gray-50 rounded">
                            {renderPurchasedProducts(sale.SaleItem)}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSale(sale)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingSaleId(sale.id)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Purchased Products</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale?.customer?.name}
                    </TableCell>
                    <TableCell>{sale?.customer?.phone}</TableCell>
                    <TableCell>₹{sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{sale.amountPaid.toFixed(2)}</TableCell>
                    <TableCell>
                      <ScrollArea className="h-20 w-48 rounded-md border">
                        <div className="p-2">
                          {renderPurchasedProducts(sale.SaleItem)}
                        </div>
                      </ScrollArea>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sale.paymentStatus === "PAID"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {sale.paymentMethod}
                    </TableCell>
                    <TableCell>
                      {new Date(sale.salesDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSale(sale)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingSaleId(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "No sales found matching your search."
                  : "No sales recorded yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {editingSale && (
        <EditSaleDialog
          sale={editingSale}
          open={!!editingSale}
          onOpenChange={(open) => !open && setEditingSale(null)}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingSaleId}
        onOpenChange={(open) => !open && setDeletingSaleId(null)}
        onConfirm={() => deletingSaleId && handleDelete(deletingSaleId)}
        title="Delete Sale Record"
        description="Are you sure you want to delete this sale record? This action cannot be undone."
      />
    </div>
  );
}
