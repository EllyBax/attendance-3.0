/*
  Warnings:

  - The primary key for the `student_module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `students` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `registrationnumber` on the `student_module` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `registrationnumber` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "student_module" DROP CONSTRAINT "student_module_registrationnumber_fkey";

-- AlterTable
ALTER TABLE "student_module" DROP CONSTRAINT "student_module_pkey",
DROP COLUMN "registrationnumber",
ADD COLUMN     "registrationnumber" BIGINT NOT NULL,
ADD CONSTRAINT "student_module_pkey" PRIMARY KEY ("registrationnumber", "modulecode");

-- AlterTable
ALTER TABLE "students" DROP CONSTRAINT "students_pkey",
DROP COLUMN "registrationnumber",
ADD COLUMN     "registrationnumber" BIGINT NOT NULL,
ADD CONSTRAINT "students_pkey" PRIMARY KEY ("registrationnumber");

-- AddForeignKey
ALTER TABLE "student_module" ADD CONSTRAINT "student_module_registrationnumber_fkey" FOREIGN KEY ("registrationnumber") REFERENCES "students"("registrationnumber") ON DELETE NO ACTION ON UPDATE NO ACTION;
