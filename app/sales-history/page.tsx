import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { ClientSideSalesComponent } from "./ClientSideSale";

const Sale = async () => {
  const { userId } = await auth();

  const saleData = await prisma.sale.findMany({
    where: { userId },
    include: {
      customer: true,
      SaleItem: { include: { product: true } },
    },
  });

  return <ClientSideSalesComponent saledata={saleData} />;
};

export default Sale;
