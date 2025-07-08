"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sale, useInventoryStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface EditSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSaleDialog({
  sale,
  open,
  onOpenChange,
}: EditSaleDialogProps) {
  const [amountPaid, setAmountPaid] = useState("");

  const updateSale = useInventoryStore((state) => state.updateSale);
  const { toast } = useToast();

  useEffect(() => {
    if (sale) {
      setAmountPaid(sale.amountPaid.toString());
    }
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAmountPaid = Number.parseFloat(amountPaid);
    if (isNaN(newAmountPaid) || newAmountPaid < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const updatedSale = {
      id: sale.id,
      amountPaid: newAmountPaid,
      paymentStatus: newAmountPaid >= sale.totalAmount ? "PAID" : "PENDING",
    };
    const response = await fetch("api/sale/update", {
      method: "PATCH",
      body: JSON.stringify({
        id: updatedSale.id,
        newPaidAmount: updatedSale.amountPaid,
        paymentStatus: updatedSale.paymentStatus,
      }),
    });
    if (response.ok) {
      const updatedSaleData = await response.json();
      console.log(updatedSaleData);

      updateSale(updatedSaleData.updatedData as Sale);
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
      alert("Payment updated successfully");
    } else {
      alert("Failed to update");
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Customer:</Label>
              <p className="font-medium">{sale.customer.name}</p>
            </div>
            <div>
              <Label>Total Amount:</Label>
              <p className="font-medium">${sale.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amountPaid">Amount Paid *</Label>
              <Input
                id="amountPaid"
                type="text"
                step="10"
                value={amountPaid}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setAmountPaid(value);
                  }
                }}
              />
            </div>

            {Number.parseFloat(amountPaid) < sale.totalAmount && (
              <div className="text-sm text-orange-600">
                Balance Due: ₹
                {(
                  sale.totalAmount - Number.parseFloat(amountPaid || "0")
                ).toFixed(2)}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Payment</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
