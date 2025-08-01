"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {  useInventoryStore } from "@/lib/store";
import { toast } from "sonner";
import { Products } from "@prisma/client";

interface EditProductDialogProps {
  product: Products;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const { updateProduct } = useInventoryStore();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        quantity: product.stockQuantity.toString(),
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.quantity) {
      toast.error("Error", {
        description: "Please fill in all required fields",
      });
      return;
    }
    const id = product.id;
    const updatedProduct = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      stockQuantity: Number.parseInt(formData.quantity),
    };
    await fetch("api/products/update", {
      method: "POST",
      body: JSON.stringify({ id, data: updatedProduct }),
    });
    updateProduct({ ...product, ...updatedProduct });
    onOpenChange(false);

    toast.success("Success", {
      description: "Product updated successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
        {" "}
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              className="mt-1"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="mt-1"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {" "}
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, price: value });
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="text"
                className="mt-1"
                value={formData.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, quantity: value });
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Update Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
