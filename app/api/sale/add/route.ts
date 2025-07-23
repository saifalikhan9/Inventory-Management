import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { METHODS, STATUS } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface ProductsPayloadType {
  productId: string;
  quantity: number;
}

interface CustomerPayloadType {
  name: string;
  phone: string;
}

interface PayloadType {
  products: ProductsPayloadType[];
  customer: CustomerPayloadType;
  paymentMethod: METHODS;
  paymentStatus: STATUS;
  amountPaid: number;
}

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );
    }

    const {
      products,
      customer,
      paymentMethod,
      paymentStatus,
      amountPaid,
    }: PayloadType = await req.json();

    // Enhanced validation
    if (
      !products?.length ||
      !customer?.name?.trim() ||
      !customer?.phone?.trim() ||
      !paymentMethod ||
      !paymentStatus ||
      typeof amountPaid !== "number" ||
      amountPaid < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Required fields are missing or invalid (products, customer, paymentMethod, paymentStatus, amountPaid)",
        },
        { status: 400 }
      );
    }

    // Validate product quantities
    if (products.some((p) => !p.productId || p.quantity <= 0)) {
      return NextResponse.json(
        {
          message:
            "All products must have valid productId and positive quantity",
        },
        { status: 400 }
      );
    }



         let existingCustomer = await prisma.customer.findUnique({
        where: { phone: customer.phone.trim() },
      });

      if (!existingCustomer) {
        existingCustomer = await prisma.customer.create({
          data: {
            userId,
            name: customer.name.trim(),
            phone: customer.phone.trim(),
          },
        });
      }

      // Get all products in a single query
      const productIds = products.map((p) => p.productId);
      const productDetails = await prisma.products.findMany({
        where: {
          id: { in: productIds },
          userId, // Ensure user owns these products
        },
        select: {
          id: true,
          name: true,
          price: true,
          stockQuantity: true,
        },
      });

      // Create product lookup map
      const productMap = new Map(productDetails.map((p) => [p.id, p]));

      // Validate all products exist and have sufficient stock
      let totalAmount = 0;
      const saleItems: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];

      for (const item of products) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        totalAmount += product.price * item.quantity;
        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }


    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      const stockUpdates = products.map((item) => {
        const product = productMap.get(item.productId)!;
        return tx.products.update({
          where: { id: item.productId },
          data: {
            stockQuantity: product.stockQuantity - item.quantity,
          },
        });
      });

      await Promise.all(stockUpdates);

      // Create sale with items
      const sale = await tx.sale.create({
        data: {
          userId,
          customerId: existingCustomer.id,
          totalAmount,
          paymentMethod,
          paymentStatus,
          amountPaid: Number(amountPaid),
          SaleItem: {
            create: saleItems,
          },
        },
        include: {
          customer: true,
          SaleItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true,
                },
              },
            },
          },
        },
        
      });

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Sales API Error:", error);

    // Handle known business logic errors
    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("Insufficient stock")
      ) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
