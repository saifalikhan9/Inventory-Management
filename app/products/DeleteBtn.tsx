"use client";
import React from "react";

const DeleteBtn = ({ id }) => {
  const handleDelete = async (productId: string) => {
    const res = await fetch("api/products/delete", {
      method: "DELETE",
      body: JSON.stringify({productId}),
    });
    if (res.ok) {
      alert("deleted");
    }
  };
  return (
    <button
      className="bg-red-400 rounded px-2 text-black"
      onClick={() => {
        handleDelete(id);
      }}
    >
      delete
    </button>
  );
};

export default DeleteBtn;
