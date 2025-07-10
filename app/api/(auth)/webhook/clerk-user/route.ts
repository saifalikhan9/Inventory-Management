import prisma from "@/lib/db/prisma";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("here");
  
  try {

    const evt = await verifyWebhook(req);
    const { id, first_name, email_addresses } = evt.data;

    if (evt.type === "user.created") {
      const email = email_addresses?.[0]?.email_address;

      if (!id || !first_name || !email) {
        return NextResponse.json("Missing data", { status: 400 });
      }

    
      const existingUser = await prisma.user.findUnique({
        where: { id }, 
      });

      if (existingUser) {
        return NextResponse.json("User already exists", { status: 200 });
      }

      const createUser = await prisma.user.create({
        data: {
           id, 
          email,
          name: first_name,
        },
      });

      return NextResponse.json(
        { data: createUser, message: "User Created Successfully" },
        { status: 201 }
      );
    }

   
    if (evt.type === "user.deleted") {
      const deletedUser = await prisma.user.delete({
        where: {  id }, 
      });

      return NextResponse.json(
        { data: deletedUser, message: "User Deleted" },
        { status: 200 }
      );
    }

    return NextResponse.json("Unhandled event type", { status: 400 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 500 });
  }
}
