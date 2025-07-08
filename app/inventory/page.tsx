import { auth } from "@clerk/nextjs/server";
import ClientSide from "./ClientSide";
import { SignIn } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";

export default async function Inventory() {
  const { userId } = await auth();
  if (!userId) {
    return <SignIn />;
  }
  const data = await prisma.products.findMany({ where: { userId } });
  return <ClientSide ProductsData={data} />;
}
