-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "reminderAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Item_reminderAt_idx" ON "Item"("reminderAt");
