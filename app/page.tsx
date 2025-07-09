import Dashboard from "@/components/DashBoard";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const salesdata = await prisma.sale.findMany({
    where: {
      userId,
    },
    include: {
      customer: true,
      SaleItem: {
        include: {
          product: true,
        },
      },
    },
  });
  const productsData = await prisma.products.findMany({
    where: {
      userId,
    },
  });
  return (
    <Dashboard
      productsInitialData={productsData}
      salesInitialData={salesdata}
    />
  );
}
