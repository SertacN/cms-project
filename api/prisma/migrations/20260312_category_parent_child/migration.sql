-- AlterTable
ALTER TABLE "ContentCategory" ADD COLUMN "parentId" INTEGER;

-- CreateIndex
CREATE INDEX "ContentCategory_parentId_idx" ON "ContentCategory"("parentId");

-- AddForeignKey
ALTER TABLE "ContentCategory" ADD CONSTRAINT "ContentCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
