import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required." },
        { status: 400 }
      );
    }

    // Check if the sale belongs to the user
    const sale = await prisma.sale.findUnique({
      where: { id, userId },
    });

    if (!sale || sale.userId !== userId) {
      return NextResponse.json(
        { error: "Sale not found or access denied." },
        { status: 404 }
      );
    }

    const deletedSale = await prisma.sale.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true, sale: deletedSale });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
