import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import ClientWrapper from "./clientWrapper";

const Products = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div>Unauthorized</div>;
  }
  const products = await prisma.products.findMany({ where: { userId } });
  console.log(products);
  
  return (
    <div className="bg-neutral-600 flex flex-col items-center justify-center w-full ">
      <h1>Products</h1>
      <ClientWrapper products={products} />
    </div>
  );
};

export default Products;
