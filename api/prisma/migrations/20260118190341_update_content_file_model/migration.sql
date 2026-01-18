/*
  Warnings:

  - Added the required column `updatedAt` to the `ContentFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "ContentFile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isTemp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isThumbnail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderBy" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "FileType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
