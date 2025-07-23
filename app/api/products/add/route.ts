import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "unauthorized user" },
        { status: 401 }
      );
    }

    const { name, description, price, stockQuantity, reorderLevel } =
      await req.json();
    if (!name || !description || !price || !stockQuantity || !reorderLevel) {
      return NextResponse.json(
        { messsage: "Required feilds are missing" },
        { status: 404 }
      );
    }

    const exhistingProduct = await prisma.products.findFirst({
      where: { name, price, description },
    });
    if (exhistingProduct) {
      const newQuantityStock = exhistingProduct.stockQuantity + stockQuantity;

      await prisma.products.update({
        where: { id: exhistingProduct.id, name },
        data: { stockQuantity: newQuantityStock },
      });
    } else {
      const newProduct = await prisma.products.create({
        data: {
          name,
          description,
          price,
          stockQuantity,
          recorderLevel: reorderLevel,
          userId,
        },
      });
      return NextResponse.json(
        { message: "successfully added new product ", newProduct },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error(error, "server error");
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};
