"use client";

import { useState } from "react";
import { METHODS, Products, STATUS } from "@prisma/client";

export default function SaleClientPage({ data }) {
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; quantity: number }[]
  >([]);
  const [mockProducts, setMockProducts] = useState<Products[]>(data);

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<METHODS>("CASH");
  const [paymentStatus, setPaymentStatus] = useState<STATUS>("PAID");
  const [amountPaid, setAmountPaid] = useState(0);

  const handleQuantityChange = (id: string, quantity: number) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productId === id);
      if (existing) {
        return prev.map((p) => (p.productId === id ? { ...p, quantity } : p));
      }
      return [...prev, { productId: id, quantity }];
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/sale/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProducts,
          customer,
          paymentMethod,
          paymentStatus,
          amountPaid
        }),
      });

      const data = await res.json();
      alert("Sale submitted")
      console.log("Sale submitted:", data);
    } catch (err) {
      console.error("Error submitting sale:", err);
    }
  };

  const totalAmount = selectedProducts.reduce((sum, item) => {
    const product = mockProducts.find((p) => p.id === item.productId);
    const productPrice = product ? product.price : 0;
    return sum + productPrice * item.quantity;
  }, 0);
  console.log(totalAmount);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-2">Create Sale</h1>

      <h2 className="font-semibold">Select Products</h2>
      {mockProducts.map((p) => (
        <div key={p.id} className="flex items-center gap-4 mb-2">
          <span>
            {p.name} - ₹{p.price}
          </span>
          <input
            type="number"
            min={0}
            placeholder="Quantity"
            onChange={(e) =>
              handleQuantityChange(p.id, parseInt(e.target.value))
            }
            className="border px-2 py-1 w-20"
          />
        </div>
      ))}

      <h2 className="font-semibold mt-4">Customer Info</h2>
      <input
        className="border px-2 py-1 mr-2"
        placeholder="Name"
        onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
      />
      <input
        className="border px-2 py-1"
        placeholder="Phone"
        onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
      />

      <div className="mt-4">
        <label className="mr-2">Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as METHODS)}
          className="border px-2 py-1"
        >
          <option value="CASH">Cash</option>
          <option value="ONLINE">Online</option>
        </select>
      </div>

      <div className="mt-2">
        <label className="mr-2">Payment Status:</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as STATUS)}
          className="border px-2 py-1"
        >
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      <div className="m-2 p-2">
        <label>Amount Paid</label>
        <input
          className="mx-2 px-2"
          type="number"
          value={amountPaid}
          onChange={(e) => {
            if (parseInt(e.target.value) <= totalAmount) {
              setAmountPaid(parseInt(e.target.value));
            } else {
              setAmountPaid(totalAmount);
            }
          }}
        />
      </div>
      <h1>{totalAmount}</h1>
      <button
        onClick={handleSubmit}
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit Sale
      </button>
    </div>
  );
}
