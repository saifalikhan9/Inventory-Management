"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export default function Sales() {
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const products = useInventoryStore((state) => state.products);
  const addSale = useInventoryStore((state) => state.addSale);
  const updateProductQuantity = useInventoryStore(
    (state) => state.updateProductQuantity
  );
  const { toast } = useToast();

  const availableProducts = products.filter((p) => p.stockQuantity > 0);
  const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        productId: "",
        productName: "",
        price: 0,
        quantity: 1,
        total: 0,
      },
    ]);
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].price = product.price;
        newItems[index].total = product.price * newItems[index].quantity;
      }
    } else if (field === "quantity") {
      newItems[index].total = newItems[index].price * value;
    }

    setSaleItems(newItems);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName ||
      !customerContact ||
      saleItems.length === 0 ||
      !paymentMode
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check stock availability
    for (const item of saleItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        toast({
          title: "Error",
          description: `Insufficient stock for ${item.productName}`,
          variant: "destructive",
        });
        return;
      }
    }

    const selectedproducts = saleItems.map((val) => ({
      productId: val.productId,
      quantity: val.quantity,
    }));
    const customer = {
      name: customerName,
      phone: customerContact,
    };

    const payload = {
      products: selectedproducts,
      customer,
      paymentMethod: paymentMode,
      paymentStatus:
        (Number.parseFloat(amountPaid) || totalAmount) >= totalAmount
          ? "PAID"
          : "PENDING",
      amountPaid,
    };
    const res = await fetch("api/sale/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert("succes");
      const data = await res.json();
      addSale(data);
    } else {
      alert("failed");
    }

    // Update inventory
    saleItems.forEach((item) => {
      updateProductQuantity(item.productId, -item.quantity);
    });

    // Reset form
    setCustomerName("");
    setCustomerContact("");
    setSaleItems([]);
    setPaymentMode("");
    setAmountPaid("");

    toast({
      title: "Success",
      description: "Sale recorded successfully",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Make Sale</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerContact">Contact Number *</Label>
                <Input
                  id="customerContact"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentMode">Payment Mode *</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="ONLINE">ONLINE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={`Total: ₹${totalAmount.toFixed(2)}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Products</CardTitle>
              <Button type="button" onClick={addSaleItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {saleItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No products added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {saleItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          updateSaleItem(index, "productId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stock: {product.stockQuantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateSaleItem(
                            index,
                            "quantity",
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Label>Price</Label>
                      <Input value={`₹${item.price.toFixed(2)}`} disabled />
                    </div>
                    <div className="w-24">
                      <Label>Total</Label>
                      <Input value={`₹${item.total.toFixed(2)}`} disabled />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSaleItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {saleItems.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                {amountPaid && Number.parseFloat(amountPaid) < totalAmount && (
                  <div className="flex justify-between items-center text-sm text-orange-600 mt-2">
                    <span>Balance Due:</span>
                    <span>
                      ₹
                      {(totalAmount - Number.parseFloat(amountPaid)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saleItems.length === 0}>
            Process Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
