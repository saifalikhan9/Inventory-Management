"use client";

import { useState } from "react";
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
import { toast } from "sonner";
export default function ClientSide() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  const products = useInventoryStore((state) => state.products);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const res = await fetch("api/products/delete", {
      method: "DELETE",
      body: JSON.stringify({ productId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Success", {
        description: "Item deleted successfully ",
      });
      deleteProduct(id);
      setDeletingProductId(null);
    } else {
      toast.error("Error", {
        description: `${data?.error?.message}`,
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <Button
          onClick={() => setIsAddProductOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">Product Inventory</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="block lg:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 px-4">
                {searchTerm
                  ? "No products found matching your search."
                  : "No products in inventory."}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-lg truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </p>
                          </div>
                          <Badge
                            variant={
                              product.stockQuantity <= product.recorderLevel
                                ? "destructive"
                                : "default"
                            }
                            className="ml-2"
                          >
                            {product.stockQuantity <= product.recorderLevel
                              ? "Low Stock"
                              : "In Stock"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-medium">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">{product.stockQuantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Reorder Level:
                            </span>
                            <p className="font-medium">
                              {product.recorderLevel}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingProductId(product.id)}
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
          <div className="hidden lg:block">
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
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
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
          </div>

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
