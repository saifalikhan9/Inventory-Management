// components/SaleItemsDisplay.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

interface SaleItemsDisplayProps {
  saleItems: SaleItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function SaleItemsDisplay({
  saleItems,
  onUpdateQuantity,
  onRemoveItem,
}: SaleItemsDisplayProps) {
  if (saleItems.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No products added yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {saleItems.map((item) => (
        <div
          key={item.productId}
          className="flex items-center justify-between border-b pb-2"
        >
          <div className="flex-grow">
            <p className="font-semibold">{item.productName}</p>
            <p className="text-sm text-gray-600">
              Price: ${item.price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                onUpdateQuantity(item.productId, parseInt(e.target.value))
              }
              className="w-20 text-center"
            />
            <p className="font-semibold w-24 text-right">
              ${item.total.toFixed(2)}
            </p>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemoveItem(item.productId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}