"use client";

import { useEffect, useState } from "react";
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
import {  useInventoryStore } from "@/lib/store";
import { EditSaleDialog } from "@/components/edit-sale-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Sale } from "@prisma/client";

export  function ClientSideSalesComponent({saledata}:{saledata:Sale[]}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<any>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  const sales = useInventoryStore((state) => state.sales);
  const deleteSale = useInventoryStore((state) => state.deleteSale);
  const setSale = useInventoryStore((state) => state.setSale);
  useEffect(() => {
    if (sales.length ===0 && saledata.length > 0) {

        setSale(saledata)
    }
  }, [sales, saledata, setSale]);

  const filteredSales = sales
    .filter(
      (sale) =>
        sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.phone.toString().includes(searchTerm)
    )
    .sort(
      (a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime()
    );
console.log(filteredSales);

  const handleDelete = (id: string) => {
    deleteSale(id);
    setDeletingSaleId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales History</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Sales Records</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
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
                    {sale.customer.name}
                  </TableCell>
                  <TableCell>{sale.customer.phone}</TableCell>
                  <TableCell>₹{sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>₹{sale.amountPaid.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sale.paymentStatus === "PAID" ? "default" : "secondary"
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
        </CardContent>
      </Card>

      <EditSaleDialog
        sale={editingSale}
        open={!!editingSale}
        onOpenChange={(open) => !open && setEditingSale(null)}
      />

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
