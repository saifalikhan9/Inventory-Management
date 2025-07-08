import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface DataTypes {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
}

interface UpdatePayload {
  id: string;

  data: DataTypes;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, data }: UpdatePayload = await req.json();

    if (!id || !data) {
      return NextResponse.json(
        { message: "Missing required data (id, updateType, data)" },
        { status: 406 }
      );
    }

    const existingProduct = await prisma.products.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found or not owned by user" },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.products.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// function badRequest(message: string) {
//   return NextResponse.json({ message }, { status: 400 });
// }
