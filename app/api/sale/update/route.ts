import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
  

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized User Please Login" },
        { status: 401 }
      );
    }
    const { newPaidAmount, paymentStatus, id } = await req.json();
    if (!newPaidAmount || !paymentStatus || !id) {
      return NextResponse.json(
        { message: "Requied Fields are Missing" },
        { status: 406 }
      );
    }
    const res = await prisma.sale.update({
      where: { id },
      data: { amountPaid: newPaidAmount, paymentStatus },
      include: { customer: true, SaleItem: { include: { product: true } } },
    });

    return NextResponse.json(
      { message: "ok", updatedData: res },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error?.message || "Internal server Error" },
        { status: 500 }
      );
    }
    console.log(error);
    return;
  }
}
