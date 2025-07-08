"use client";
import React, { useState } from "react";
import DeleteBtn from "./DeleteBtn";
import FormsFields, { ProductsType } from "./formsFeilds";
import { Products } from "@prisma/client";

const ClientWrapper = ({ products }: { products: Products[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [filteredData, setFilteredData] = useState<ProductsType>(products[0]);
  console.log(isEditing);

  return (
    <div>
      <div className="p-5 flex gap-10">
        {products?.map((val) => (
          <ul key={val.id}>
            <li>Name {val.name}</li>
            <li>Description{val.description}</li>
            <li>Price {val.price}</li>
            <li> Stock{val.stockQuantity}</li>
            <DeleteBtn id={val.id} />
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setFilteredData(val);
              }}
              className="m-2  px-3 bg-white border rounded text-black "
            >
              Edit
            </button>
          </ul>
        ))}
      </div>
      <div className=" bg-white m-2 text-black  rounded p-2">
        <FormsFields isEditing={isEditing} data={filteredData} />
      </div>
    </div>
  );
};

export default ClientWrapper;
