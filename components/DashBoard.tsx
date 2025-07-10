"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { AddProductDialog } from "@/components/add-product-dialog";
import { useInventoryStore } from "@/lib/store";

export default function Dashboard({ productsInitialData, salesInitialData }) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const products = useInventoryStore((state) => state.products);
  const sales = useInventoryStore((state) => state.sales);
  const setProducts = useInventoryStore((state) => state.setProducts);
  const setSale = useInventoryStore((state) => state.setSale);

  useEffect(() => {
    if (
      (products.length === 0 && productsInitialData.length > 0) ||
      (sales.length === 0 && salesInitialData.length > 0)
    ) {
      setProducts(productsInitialData);
      setSale(salesInitialData);
    }
  }, [
    products,
    sales,
    productsInitialData,
    salesInitialData,
    setProducts,
    setSale,
  ]);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.recorderLevel
  );
  const todaysSales = sales.filter((sale) => {
    const today = new Date().toDateString();
    return new Date(sale.salesDate).toDateString() === today;
  });
  const dailyRevenue = todaysSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );
  const recentSales = sales.slice(-5).reverse();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <Button
          onClick={() => setIsAddProductOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {" "}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Sales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{dailyRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                All products are well stocked!
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-orange-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {product.stockQuantity} | Reorder:{" "}
                        {product.recorderLevel}
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="self-start sm:self-center"
                    >
                      Low Stock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No sales recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {sale.customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.salesDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <p className="font-medium">
                        ₹{sale.totalAmount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          sale.paymentStatus === "PAID"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
      />
    </div>
  );
}
