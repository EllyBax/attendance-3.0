-- CreateTable
CREATE TABLE "fingerprintscans" (
    "createdat" TIMESTAMP(6) NOT NULL,
    "fingerprintid" INTEGER NOT NULL,

    CONSTRAINT "fingerprintscans_pkey" PRIMARY KEY ("createdat","fingerprintid")
);

-- CreateTable
CREATE TABLE "timetable" (
    "id" SERIAL NOT NULL,
    "starttime" TEXT,
    "endtime" TEXT,
    "modulecode" TEXT,
    "classid" INTEGER,
    "day" TEXT,
    "modulename" TEXT,
    "venue" TEXT,

    CONSTRAINT "timetable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_classid_fkey" FOREIGN KEY ("classid") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_modulecode_fkey" FOREIGN KEY ("modulecode") REFERENCES "modules"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;
