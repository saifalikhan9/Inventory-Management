import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Users
  const user1 = await prisma.user.create({
    data: {
      email: "owner1@example.com",
      hashedPassword: "hashed_password_1",
      name: "Owner One",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "owner2@example.com",
      hashedPassword: "hashed_password_2",
      name: "Owner Two",
    },
  });

  // Customers for user1
  const customer1 = await prisma.customer.create({
    data: {
      name: "John Customer",
      phone: "1234567890",
      userId: user1.id,
    },
  });

  // Products for user1
  const product1 = await prisma.products.create({
    data: {
      name: "Hammer",
      description: "Heavy-duty steel hammer",
      price: 200,
      stockQuantity: 50,
      recorderLevel: 10,
      userId: user1.id,
    },
  });

  const product2 = await prisma.products.create({
    data: {
      name: "Screwdriver",
      description: "Flat-head screwdriver",
      price: 80,
      stockQuantity: 100,
      recorderLevel: 20,
      userId: user1.id,
    },
  });

  // Sale with SaleItems
  const sale1 = await prisma.sale.create({
    data: {
      userId: user1.id,
      customerId: customer1.id,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      totalAmount: 280,
      SaleItem: {
        create: [
          {
            productId: product1.id,
            price: 200,
            quantity: 1,
          },
          {
            productId: product2.id,
            price: 80,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("Seed completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
