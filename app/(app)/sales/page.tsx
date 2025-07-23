"use client";
import React, { useState } from "react";
import { Plus, Package, Trash2 } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import ProductDialog from "@/components/ProductSelectionDialog";
import { CustomerInfoCard } from "@/components/CustomerInfoCard";
import { Button } from "@/components/ui/button";

import { METHODS, STATUS } from "@prisma/client";
import { toast } from "sonner";
import Link from "next/link";

const ProductManager: React.FC = () => {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(
    {}
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [paymentMethod, setpaymentMethod] = useState<METHODS>("CASH");
  const [paymentStatus, setpaymentStatus] = useState<STATUS>("PENDING");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const products = useInventoryStore((state) => state.products);
  const addsale = useInventoryStore((state) => state.addSale);
  const updateProductQuantity = useInventoryStore(
    (state) => state.updateProductQuantity
  );

  const selectedProducts = products.filter((product) =>
    selectedProductIds.has(product.id)
  );

  const handleSaveProducts = (newSelectedIds: Set<string>) => {
    const newQuantities = { ...quantities };

    // Set default quantity 1 for newly added products
    newSelectedIds.forEach((id) => {
      if (!newQuantities[id]) {
        newQuantities[id] = 1;
      }
    });

    // Remove quantities for removed products
    Object.keys(newQuantities).forEach((id) => {
      if (!newSelectedIds.has(id)) {
        delete newQuantities[id];
      }
    });

    setSelectedProductIds(newSelectedIds);
    setQuantities(newQuantities);
  };

  // const handleRemoveProduct = (productId: string) => {
  //   const newSelection = new Set(selectedProductIds);
  //   newSelection.delete(productId);
  //   setSelectedProductIds(newSelection);
  // };

  const handleClearAll = () => {
    setSelectedProductIds(new Set());
  };

  const totalValue = selectedProducts.reduce(
    (sum, product) => sum + quantities[product.id] * product.price,
    0
  );

  const incrementQuantity = (productId: string) => {
    const product = selectedProducts.find((p) => p.id === productId);
    if (!product) return;

    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;

      // Don't allow increment if current quantity is equal to stockQuantity
      if (currentQty >= product.stockQuantity) {
        toast.warning("No unit left", {
          action: (
            <Link href={"/inventory"}>
              <Button className="" size={"sm"} variant={"outline"}>
                Click to add
              </Button>
            </Link>
          ),
          description: "Try to add more Products",
        });
        return prev;
      }

      return {
        ...prev,
        [productId]: currentQty + 1,
      };
    });
  };
  const zeroStock = selectedProducts.filter((v) => v.stockQuantity === 0);

  const decrementQuantity = (productId: string) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      return {
        ...prev,
        [productId]: current > 1 ? current - 1 : 1,
      };
    });
  };

  const handleProcessSale = async () => {
    setLoading(true);
    if (!customerName || !customerContact || selectedProducts.length === 0) {
      toast.error("Please fill all required fields and select products.");
      setLoading(false);
      return;
    }
    if (zeroStock.length > 0) {
      toast.error(`${zeroStock.map((v) => v.name)}`, {
        description: "This product is not Availiable",
      });
      setLoading(false);
      return;
    }
    if (amountPaid === totalValue) {
      setpaymentStatus(STATUS.PAID);
    }
    const data = {
      products: selectedProducts.map((val) => {
        return {
          productId: val.id,
          quantity: quantities[val.id],
        };
      }),
      customer: {
        name: customerName,
        phone: customerContact,
      },
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      amountPaid,
    };
    try {
      const response = await fetch("api/sale/add", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const data = await response.json();
        addsale(data);
        data.SaleItem.forEach(
          ({
            productId,
            quantity,
          }: {
            productId: string;
            quantity: number;
          }) => {
            updateProductQuantity(productId, -quantity);
          }
        );

        setQuantities({});
        setSelectedProductIds(new Set());
        setCustomerName("");
        setCustomerContact("");
        setAmountPaid(0);
        toast.success("Sale processed successfully!");
      }
    } catch (error) {
      toast.error("Something Went Wrong");
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-175 bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold ">Make sale</h1>
            <div className="flex justify-center gap-x-2">
              <Button
                onClick={handleProcessSale}
                disabled={loading}
                variant="outline"
                className="relative shadow-neutral-950"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full" />
                    Processing...
                  </span>
                ) : (
                  "Process Sale"
                )}
              </Button>

              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-5 w-5" />
                <span>
                  {selectedProducts.length > 0
                    ? "Add or Remove"
                    : "Add Products"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Selected Products
              </h2>

              {selectedProducts.length > 0 && (
                <div className="border-b-2 border-blue-500  p-1">
                  <h2 className="font-medium">Total Amount ₹{totalValue}</h2>
                </div>
              )}

              {selectedProducts.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Click &quot;Add Products&quot; to start building your product
                  selection
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-70 overflow-auto px-2">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h1 className="text-base font-medium text-gray-900">
                          {product.name}
                        </h1>
                        <p className="text-base font-semibold text-gray-500">
                          {product.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrementQuantity(product.id)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span>{quantities[product.id] || 1}</span>
                        <button
                          onClick={() => incrementQuantity(product.id)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CustomerInfoCard
            setpaymentMethod={setpaymentMethod}
            setpaymentStatus={setpaymentStatus}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerContact={customerContact}
            setCustomerContact={setCustomerContact}
          />
        </div>
        <div className="max-w-sm"></div>
      </div>

      {/* Product Dialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        products={products}
        selectedProductIds={selectedProductIds}
        onSave={handleSaveProducts}
      />
    </div>
  );
};

export default ProductManager;
