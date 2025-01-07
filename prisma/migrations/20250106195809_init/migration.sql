/*
  Warnings:

  - You are about to drop the column `description` on the `Announcement` table. All the data in the column will be lost.
  - Added the required column `content` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "description",
ADD COLUMN     "content" TEXT NOT NULL;
