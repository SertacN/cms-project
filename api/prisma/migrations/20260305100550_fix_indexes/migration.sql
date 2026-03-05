/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Project";

-- CreateIndex
CREATE INDEX "Content_isDeleted_isActive_idx" ON "Content"("isDeleted", "isActive");

-- CreateIndex
CREATE INDEX "ContentCategory_isDeleted_idx" ON "ContentCategory"("isDeleted");

-- CreateIndex
CREATE INDEX "ContentFile_contentId_idx" ON "ContentFile"("contentId");

-- CreateIndex
CREATE INDEX "ContentParameterDefinition_categoryId_idx" ON "ContentParameterDefinition"("categoryId");

-- CreateIndex
CREATE INDEX "User_isDeleted_isActive_idx" ON "User"("isDeleted", "isActive");
