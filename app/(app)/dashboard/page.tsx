import Dashboard from "@/components/DashBoard";

import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function DashBoard() {
  const { userId } = await auth();
  const data = await prisma.products.findMany({
    where: {
      userId: userId!,
    },
  });
  const salesData = await prisma.sale.findMany({
    where: {
      userId: userId!,
    },
    include: { customer: true, SaleItem: true },
  });

  return <Dashboard productsInitialData={data} salesInitialData={salesData} />;
}
