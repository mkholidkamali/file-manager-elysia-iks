/*
  Warnings:

  - You are about to drop the column `updatedAat` on the `Folder` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "updatedAat",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "depth" DROP NOT NULL,
ALTER COLUMN "orderIndex" DROP NOT NULL;
