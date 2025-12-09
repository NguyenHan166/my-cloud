/*
  Warnings:

  - You are about to drop the column `accountId` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `CollectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Embedding` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `SharedLink` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountUsage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,slugPublic]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CollectionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Embedding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SharedLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AccountMember" DROP CONSTRAINT "AccountMember_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountMember" DROP CONSTRAINT "AccountMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "AccountUsage" DROP CONSTRAINT "AccountUsage_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_accountId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionItem" DROP CONSTRAINT "CollectionItem_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Embedding" DROP CONSTRAINT "Embedding_accountId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_accountId_fkey";

-- DropForeignKey
ALTER TABLE "SharedLink" DROP CONSTRAINT "SharedLink_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_accountId_fkey";

-- DropIndex
DROP INDEX "Collection_accountId_idx";

-- DropIndex
DROP INDEX "Collection_accountId_slugPublic_key";

-- DropIndex
DROP INDEX "CollectionItem_accountId_idx";

-- DropIndex
DROP INDEX "Embedding_accountId_idx";

-- DropIndex
DROP INDEX "Item_accountId_idx";

-- DropIndex
DROP INDEX "SharedLink_accountId_idx";

-- DropIndex
DROP INDEX "Tag_accountId_idx";

-- DropIndex
DROP INDEX "Tag_accountId_name_key";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "CollectionItem" DROP COLUMN "accountId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Embedding" DROP COLUMN "accountId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "SharedLink" DROP COLUMN "accountId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "accountId",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "AccountMember";

-- DropTable
DROP TABLE "AccountUsage";

-- DropEnum
DROP TYPE "AccountRole";

-- CreateTable
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedStorageBytes" BIGINT NOT NULL DEFAULT 0,
    "maxStorageBytes" BIGINT NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "maxItems" INTEGER NOT NULL DEFAULT 0,
    "collectionCount" INTEGER NOT NULL DEFAULT 0,
    "maxCollections" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_userId_key" ON "UserUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_slugPublic_key" ON "Collection"("userId", "slugPublic");

-- CreateIndex
CREATE INDEX "CollectionItem_userId_idx" ON "CollectionItem"("userId");

-- CreateIndex
CREATE INDEX "Embedding_userId_idx" ON "Embedding"("userId");

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "SharedLink_userId_idx" ON "SharedLink"("userId");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedLink" ADD CONSTRAINT "SharedLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
