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
import { Search, Edit, Trash2, Plus } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import { AddProductDialog } from "@/components/add-product-dialog";
import { EditProductDialog } from "@/components/edit-product-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
export default function ClientSide({ ProductsData }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  const products = useInventoryStore((state) => state.products);
  const setProducts = useInventoryStore((state) => state.setProducts);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);
  useEffect(() => {
    if (products.length === 0 && ProductsData?.length > 0) {
      setProducts(ProductsData);
    }
  }, [products, ProductsData, setProducts]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const res = await fetch("api/products/delete",{
      method:"DELETE",
      body : JSON.stringify({productId:id})
    })
    if (res.ok) {
      alert("Success")
    }
    deleteProduct(id);
    setDeletingProductId(null);
  };

  return (
  
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>{product.recorderLevel}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stockQuantity <= product.recorderLevel
                          ? "destructive"
                          : "default"
                      }
                    >
                      {product.stockQuantity <= product.recorderLevel
                        ? "Low Stock"
                        : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingProductId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No products found matching your search."
                : "No products in inventory."}
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
      />

      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
        onConfirm={() => deletingProductId && handleDelete(deletingProductId)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
