/*
  Warnings:

  - You are about to drop the column `fileId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_fileId_fkey";

-- DropIndex
DROP INDEX "Item_fileId_idx";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "fileId",
DROP COLUMN "mimeType",
DROP COLUMN "size";

-- CreateTable
CREATE TABLE "ItemFile" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemFile_itemId_idx" ON "ItemFile"("itemId");

-- CreateIndex
CREATE INDEX "ItemFile_fileId_idx" ON "ItemFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemFile_itemId_fileId_key" ON "ItemFile"("itemId", "fileId");

-- AddForeignKey
ALTER TABLE "ItemFile" ADD CONSTRAINT "ItemFile_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemFile" ADD CONSTRAINT "ItemFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
