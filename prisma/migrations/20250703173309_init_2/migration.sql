/*
  Warnings:

  - You are about to drop the column `totalAmmount` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "totalAmmount",
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;
