import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );
    }
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        {
          message: "requied fields are empty or undefined",
        },
        { status: 406 }
      );
    }
  await prisma.products.delete({ where: { id: productId } });
    return NextResponse.json(
      { message: "success fully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
