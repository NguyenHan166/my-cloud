-- CreateEnum
CREATE TYPE "CollectionPermission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "isTrashed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CollectionShare" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "CollectionPermission" NOT NULL DEFAULT 'VIEW',
    "sharedById" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CollectionShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionShare_collectionId_idx" ON "CollectionShare"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionShare_userId_idx" ON "CollectionShare"("userId");

-- CreateIndex
CREATE INDEX "CollectionShare_permission_idx" ON "CollectionShare"("permission");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionShare_collectionId_userId_key" ON "CollectionShare"("collectionId", "userId");

-- CreateIndex
CREATE INDEX "Item_isTrashed_idx" ON "Item"("isTrashed");

-- CreateIndex
CREATE INDEX "Item_trashedAt_idx" ON "Item"("trashedAt");

-- AddForeignKey
ALTER TABLE "CollectionShare" ADD CONSTRAINT "CollectionShare_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionShare" ADD CONSTRAINT "CollectionShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionShare" ADD CONSTRAINT "CollectionShare_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
