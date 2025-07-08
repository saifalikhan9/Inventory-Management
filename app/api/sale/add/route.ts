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

    if (
      !products ||
      !customer ||
      !paymentMethod ||
      !paymentStatus ||
      !amountPaid
    ) {
      return NextResponse.json(
        {
          message:
            "Requied Feilds are missing (products, customer, paymentMethod, paymentStatus)",
        },
        { status: 406 }
      );
    }
    let exhistingCustomer = await prisma.customer.findUnique({
      where: {
        phone: customer?.phone,
      },
    });

    if (!exhistingCustomer) {
      exhistingCustomer = await prisma.customer.create({
        data: {
          userId,
          name: customer.name,
          phone: customer.phone,
        },
      });
    }

    let totalAmount: number = 0.0;
    for (const item of products) {
      const productDetailes = await prisma.products.findUnique({
        where: {
          id: item.productId,
        },
      });
      if (!productDetailes || productDetailes.stockQuantity < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${productDetailes?.name}` },
          { status: 400 }
        );
      }
      totalAmount = totalAmount + productDetailes.price * item.quantity;
    }
    const sale = await prisma.sale.create({
      data: {
        userId,
        customerId: exhistingCustomer.id,
        totalAmount,
        paymentMethod,
        paymentStatus,
        amountPaid: Number(amountPaid),
        SaleItem: {
          create: await Promise.all(
            products.map(async (item) => {
              const product = await prisma.products.findUnique({
                where: {
                  id: item.productId,
                },
              });

              await prisma.products.update({
                where: {
                  id: item.productId,
                },
                data: {
                  stockQuantity: product!.stockQuantity - item.quantity,
                },
              });
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product?.price,
              };
            })
          ),
        },
      },
    });
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
