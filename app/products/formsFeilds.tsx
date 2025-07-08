"use client";
import React, { useEffect, useState } from "react";
export interface ProductsType {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  recorderLevel: number;
}

const FormsFields = ({
  isEditing,
  data,
}: {
  isEditing: boolean;
  data: ProductsType;
}) => {
  const [formData, setFormData] = useState<ProductsType>({
    name: "",
    description: "",
    price: 0.0,
    stockQuantity: 0,
    recorderLevel: 10,
  });
  useEffect(() => {
    if (isEditing && data) {
      setFormData(data);
    }
  }, [isEditing, data]);
  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(isEditing, "bool");

      if (isEditing === true) {
        
      } else {
        console.log(isEditing, "boolean");
        const res = await fetch("api/products/add", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handlesubmit}>
        <input
          className="p-1 mx-2 border rounded"
          type="text"
          placeholder="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
          }}
        />
        <input
          type="text"
          className="p-1 mx-2 border rounded"
          placeholder="description"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
          }}
        />
        <input
          type="number"
          className="p-1 mx-2 border rounded"
          placeholder="price"
          value={formData.price}
          onChange={(e) => {
            setFormData({ ...formData, price: parseFloat(e.target.value) });
          }}
        />
        <input
          type="number"
          className="p-1 mx-2 border rounded"
          placeholder="stockQuantity"
          value={formData.stockQuantity}
          onChange={(e) => {
            setFormData({
              ...formData,
              stockQuantity: parseInt(e.target.value),
            });
          }}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormsFields;
