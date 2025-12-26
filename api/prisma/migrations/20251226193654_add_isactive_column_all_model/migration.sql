/*
  Warnings:

  - You are about to drop the column `order` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "order",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderBy" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "order",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderBy" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
