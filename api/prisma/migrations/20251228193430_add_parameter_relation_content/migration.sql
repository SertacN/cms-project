/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_contentId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "ContentCategory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sefUrl" TEXT NOT NULL,
    "orderBy" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "contentId" INTEGER,

    CONSTRAINT "ContentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentParameterDefinition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "orderBy" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "ContentParameterDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentParameterValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "contentId" INTEGER NOT NULL,
    "definitionId" INTEGER NOT NULL,

    CONSTRAINT "ContentParameterValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentCategory_title_key" ON "ContentCategory"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ContentCategory_sefUrl_key" ON "ContentCategory"("sefUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ContentParameterDefinition_categoryId_name_key" ON "ContentParameterDefinition"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ContentParameterValue_contentId_definitionId_key" ON "ContentParameterValue"("contentId", "definitionId");

-- AddForeignKey
ALTER TABLE "ContentFile" ADD CONSTRAINT "ContentFile_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentParameterDefinition" ADD CONSTRAINT "ContentParameterDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ContentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentParameterValue" ADD CONSTRAINT "ContentParameterValue_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentParameterValue" ADD CONSTRAINT "ContentParameterValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "ContentParameterDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ContentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
