-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "lessonid" INTEGER NOT NULL,
    "fingerprintid" VARCHAR(255) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "departmentcode" VARCHAR(10) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "hod" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" INTEGER NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "departmentcode" VARCHAR(10) NOT NULL,

    CONSTRAINT "hod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "classid" INTEGER NOT NULL,
    "modulecode" VARCHAR(20) NOT NULL,
    "starttime" TEXT NOT NULL,
    "endtime" TEXT NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "teacherid" BIGINT NOT NULL,
    "departmentcode" VARCHAR(10) NOT NULL,
    "classid" INTEGER,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "student_module" (
    "registrationnumber" BIGINT NOT NULL,
    "modulecode" VARCHAR(20) NOT NULL,

    CONSTRAINT "student_module_pkey" PRIMARY KEY ("registrationnumber","modulecode")
);

-- CreateTable
CREATE TABLE "students" (
    "name" VARCHAR(255) NOT NULL,
    "registrationnumber" BIGINT NOT NULL,
    "fingerprintid" VARCHAR(255) NOT NULL,
    "classid" INTEGER NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("registrationnumber")
);

-- CreateTable
CREATE TABLE "teachers" (
    "name" VARCHAR(255) NOT NULL,
    "identificationnumber" BIGINT NOT NULL,
    "departmentcode" VARCHAR(10) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("identificationnumber")
);

-- CreateIndex
CREATE UNIQUE INDEX "hod_email_key" ON "hod"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_fingerprintid_key" ON "students"("fingerprintid");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_identificationnumber_key" ON "teachers"("identificationnumber");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_lessonid_fkey" FOREIGN KEY ("lessonid") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_departmentcode_fkey" FOREIGN KEY ("departmentcode") REFERENCES "department"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_classid_fkey" FOREIGN KEY ("classid") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_modulecode_fkey" FOREIGN KEY ("modulecode") REFERENCES "modules"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_classid_fkey" FOREIGN KEY ("classid") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_departmentcode_fkey" FOREIGN KEY ("departmentcode") REFERENCES "department"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_module" ADD CONSTRAINT "student_module_modulecode_fkey" FOREIGN KEY ("modulecode") REFERENCES "modules"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_module" ADD CONSTRAINT "student_module_registrationnumber_fkey" FOREIGN KEY ("registrationnumber") REFERENCES "students"("registrationnumber") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classid_fkey" FOREIGN KEY ("classid") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_departmentcode_fkey" FOREIGN KEY ("departmentcode") REFERENCES "department"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;
