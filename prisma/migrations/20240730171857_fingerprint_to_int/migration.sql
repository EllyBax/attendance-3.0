/*
  Warnings:

  - Changed the type of `fingerprintid` on the `attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fingerprintid` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "fingerprintid",
ADD COLUMN     "fingerprintid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "fingerprintid",
ADD COLUMN     "fingerprintid" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_fingerprintid_key" ON "students"("fingerprintid");
