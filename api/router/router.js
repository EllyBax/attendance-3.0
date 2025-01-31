import express from "express";
import flash from "connect-flash";
import session from "express-session";
import dotenv from "dotenv";
import pkg from "pg";
import argon from "argon2";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  query_timeout: 20000,
  connectionTimeoutMillis: 25000,
});

const prisma = new PrismaClient();

const navlinks = {
  index: [],

  home: [
    { url: "/new-student", name: "New Student" },
    { url: "/new-teacher", name: "New Teacher" },
    { url: "/get-class", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
  newStudent: [
    { url: "/home", name: "Home" },
    { url: "/new-teacher", name: "New Teacher" },
    { url: "/get-class", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
  newTeacher: [
    { url: "/home", name: "home" },
    { url: "/new-student", name: "New Student" },
    { url: "/get-class", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
  recordSession: [
    { url: "/home", name: "home" },
    { url: "/new-student", name: "New Student" },
    { url: "/new-teacher", name: "New Teacher" },
    { url: "/logout", name: "Logout" },
  ],
  general: [
    { url: "/home", name: "home" },
    { url: "/new-student", name: "New Student" },
    { url: "/new-teacher", name: "New Teacher" },
    { url: "/get-class", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
};

const daysOfTheWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const router = express.Router();
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
router.use(flash());
router.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Debugging middleware to log requests
// router.use((req, res, next) => {
//   console.log("Request Body:", req.body);
//   next();
// });

function requireLogin(req, res, next) {
  if (req.session.sessionId) {
    next();
  } else {
    req.flash("error", "Please login to continue!");
    return res.redirect("/teacher-login");
  }
}

function requireHodLogin(req, res, next) {
  if (req.session.hodId) {
    next();
  } else {
    req.flash("error", "This page requires admin login!");
    return res.redirect("/hod-login");
  }
}

function requireFingerprintId(req, res, next) {
  if (req.session.studentFingerprintId) {
    req.flash("success", "Fingerprint succesfully scanned!");
    next();
  } else {
    req.flash("error", "Enter fingerprint!");
    return res.redirect("/scan-fingerprint");
  }
}

// home page
router.get("/", (req, res) => {
  res.render("pages/index", { title: "Welcome", links: navlinks.index });
});

router.get("/home", (req, res) => {
  if (req.session.hodId) {
    res.redirect("/hod-index");
  } else if (req.session.sessionId) {
    res.redirect("/teacher-index");
  } else {
    res.redirect("/");
  }
});

/**
 * Routes related to the Head of Department (HOD) functionality.
 * These routes handle HOD login, index page, and new HOD registration.
 */
// hod routes
router.get("/hod-login", (req, res) => {
  return res.render("pages/hod-login", {
    title: "HOD Login",
    links: navlinks.index,
  });
});

router.post("/hod-login", async (req, res) => {
  const { email, password } = req.body;
  const existingHOD = await prisma.hod.findFirst({
    where: {
      email: email,
    },
  });
  if (!existingHOD) {
    req.flash("error", "Invalid email!");
    return res.redirect("back");
  } else {
    const validPassword = await argon.verify(existingHOD.password, password);
    if (validPassword) {
      req.session.departmentcode = existingHOD.departmentcode;
      req.session.sessionId = `${existingHOD.departmentcode}-${existingHOD.id}`;
      req.session.hodId = `${existingHOD.departmentcode}-${existingHOD.id}`;
      return res.redirect("/hod-index");
    } else {
      req.flash("error", "Incorrect password");
      return res.redirect("back");
    }
  }
});

router.get("/hod-index", requireHodLogin, (req, res) => {
  return res.render("pages/hod-index", {
    title: "HOD homepage",
    links: navlinks.home,
  });
});

router.get("/teacher-index", requireLogin, async (req, res) => {
  try {
    const loggedInTeacher = await prisma.teachers.findFirst({
      where: { identificationnumber: BigInt(req.session.teacherId) },
    });

    const modules = await prisma.modules.findMany({
      where: { teacherid: loggedInTeacher.identificationnumber },
    });
    return res.render("pages/teacher-index", {
      modules,
      name: loggedInTeacher.name,
      title: "Teacher homepage",
      links: navlinks.home,
    });
  } catch (error) {
    console.error("Error fetching teachers modules: ", error);
    req.flash("error", "Couldn't find teacher's modules");
    res.redirect("back");
    throw new Error(error);
  }
});

router.get("/new-hod", async (req, res) => {
  return res.render("pages/new-hod", {
    title: "Register HOD",
    links: navlinks.general,
  });
});

router.post("/hod-registration", async (req, res) => {
  const hodData = req.body;
  let data = {
    name: hodData.name,
    email: hodData.email,
    phone: parseInt(hodData.phone),
    password: await argon.hash(hodData.password),
    departmentcode: hodData.departmentcode,
  };
  try {
    const existingHOD = await prisma.hod.findFirst({
      where: {
        departmentcode: data.departmentcode,
      },
    });
    if (existingHOD === null) {
      const hod = await prisma.hod.create({
        data: data,
      });
      req.session.departmentcode = hod.departmentcode;
      req.session.sessionId = `${hod.departmentcode}-${hod.id}`;
      req.session.hodId = `${hod.departmentcode}-${hod.id}`;
      return res.redirect("/hod-index");
    } else {
      req.flash("error", "HOD exists for this department!");
      return res.redirect("back");
    }
  } catch (error) {
    throw new Error("Error: ", error);
  }
});

/**
 * Routes related to teacher functionality, including login, registration, and module management.
 */
router.get("/teachers", requireHodLogin, async (req, res) => {
  const modules = await prisma.modules.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });

  const teachersPromise = modules.map(async (_module) => {
    const teachers = await prisma.teachers.findMany({
      where: {
        identificationnumber: _module.teacherid,
      },
    });
    return teachers;
  });

  const teachers = (await Promise.all(teachersPromise)).flat();

  const departmentTeachers = await prisma.teachers.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });
  return res.render("pages/teachers", {
    title: "teachers page",
    teachers: departmentTeachers,
    links: navlinks.general,
  });
});

router.get("/teacher-login", (req, res) => {
  return res.render("pages/teacher-login", {
    title: "Teacher Login",
    links: navlinks.index,
  });
});

router.post("/teacher-login", async (req, res) => {
  const { id, password } = req.body;
  const existingTeacher = await prisma.teachers.findFirst({
    where: {
      identificationnumber: id,
    },
  });
  if (!existingTeacher) {
    req.flash("error", "User with this id doesn't exist");
    return res.redirect("back");
  } else {
    const validPassword = argon.verify(existingTeacher.password, password);
    if (validPassword) {
      req.session.sessionId = `${existingTeacher.departmentcode}-${existingTeacher.identificationnumber}`;
      req.session.teacherId = existingTeacher.identificationnumber.toString(); // Convert BigInt to string
      req.session.departmentcode = existingTeacher.departmentcode;
      req.flash("success", "Login Successful");
      return res.redirect(`/home`);
    } else {
      req.flash("error", "Invalid Password");
      return res.redirect("back");
    }
  }
});

router.get("/new-teacher", requireHodLogin, async (req, res) => {
  const departments = await prisma.department.findMany();
  return res.render("pages/new-teacher", {
    title: "new teacher page",
    departments: departments,
    links: navlinks.newTeacher,
  });
});

router.post("/teacher-registration", async (req, res) => {
  const { name, identificationNumber, department, password } = req.body;
  const hashedPassword = await argon.hash(password)
  try {
    const teacher = await prisma.teachers.create({
      data: {
        identificationnumber: identificationNumber,
        name: name,
        departmentcode: department,
        password: hashedPassword,
      },
    });
    console.log("Teacher created successfully!\n");
    req.flash("success", "Profile created successfully");
    req.session.sessionId = `${teacher.departmentcode}-${teacher.identificationnumber}`;
    return res.redirect(`/teachers/${teacher.identificationnumber}`);
  } catch (err) {
    console.error("Error creating profile:", err);
    req.flash("error", "Error creating profile");
    return res.redirect("back");
  }
});

router.get("/teachers/:id", requireLogin, async (req, res) => {
  const id = req.params.id;
  const teacher = await prisma.teachers.findUnique({
    where: { identificationnumber: id },
  });
  const modules = await prisma.modules.findMany({
    where: { teacherid: teacher.identificationnumber },
  });
  return res.render("pages/teacher-profile", {
    title: "Teacher Profile",
    teacher,
    modules,
    links: navlinks.general,
  });
});

/**
 * Fetches and renders a list of classes based on the department code stored in the session.
 *
 * @route GET /classes
 * @param {string} req.session.departmentcode - The department code to filter classes by.
 * @returns {Promise<void>} Renders the 'pages/classes' view with the fetched classes.
 */
// classes routes
router.get("/classes", requireHodLogin, async (req, res) => {
  const classes = await prisma.classes.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });
  return res.render("pages/classes", {
    title: "classes page",
    classes: classes,
    links: navlinks.general,
  });
});

/**
 * Fetches and renders a list of modules based on the department code stored in the session.
 *
 * @route GET /modules
 * @param {string} req.session.departmentcode - The department code to filter modules by.
 * @returns {Promise<void>} Renders the 'pages/modules' view with the fetched modules.
 */
// modules routes
router.get("/modules", requireHodLogin, async (req, res) => {
  const modules = await prisma.modules.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });
  return res.render("pages/modules", {
    title: "Modules page",
    modules: modules,
    links: navlinks.general,
  });
});

router.get("/modules/:className", requireHodLogin, async (req, res) => {
  const _class = req.params.className;
  const _classid = await prisma.classes.findFirst({
    where: {
      name: _class,
    },
    select: {
      id: true,
    },
  });
  const modules = await prisma.modules.findMany({
    where: {
      classid: _classid.id,
    },
  });
  return res.render("pages/modules", {
    title: `${_class} Modules page`,
    modules: modules,
    _class,
    links: navlinks.general,
  });
});

/**
 * Fetches and renders a list of courses based on the department code stored in the session.
 *
 * @route GET /courses
 * @param {string} req.session.departmentcode - The department code to filter courses by.
 * @returns {Promise<void>} Renders the 'pages/courses' view with the fetched courses.
 */
// courses
// router.get("/courses", requireHodLogin, async (req, res) => {
//   const courses = await prisma.cour
//   return res.render("pages/courses", {
//     title: "courses",
//     courses: courses,
//   });
// });

// students
router.get("/students", requireLogin, async (req, res) => {
  const _class = await prisma.classes.findFirst({
    where: {
      id: req.session.studentClass,
    },
  });
  const students = await prisma.students.findMany({
    where: {
      classid: _class.id,
    },
  });
  return res.render("pages/students", {
    title: `${_class.name} Students`,
    students,
    links: navlinks.newStudent,
  });
});

router.get("/new-student", requireLogin, async (req, res) => {
  const classes = await prisma.classes.findMany();
  return res.render("pages/new-student", {
    title: "Register Student",
    classes,
    links: navlinks.newStudent,
  });
});

router.post("/student-registration", requireLogin, async (req, res) => {
  const { name, registrationNumber, _class } = req.body;

  if (name === "" || registrationNumber === "" || _class == "") {
    req.flash("error", "Fill in all required fields!");
    return res.redirect("back");
  }

  try {
    const _classid = await prisma.classes.findFirst({
      where: { name: _class },
      select: { id: true },
    });

    if (!_classid) {
      req.flash("error", "Invalid class selected");
      return res.redirect("back");
    }

    let lastFingerprintId = await prisma.students.count({
      where: { classid: _classid.id },
    });

    let fingerprintid = ++lastFingerprintId;

    const student = await prisma.students.create({
      data: {
        name,
        registrationnumber: registrationNumber,
        classid: _classid.id,
        fingerprintid: fingerprintid,
      },
    });

    req.session.studentId = student.registrationnumber.toString();
    req.session.studentClass = student.classid;
    req.session.fingerprintid = student.fingerprintid;
    req.flash(
      "success",
      `Registration successful, your fingerprint id is ${req.session.fingerprintid}`
    );
    return res.redirect("/select-modules");
  } catch (error) {
    console.error("Error in student registration:", error);
    req.flash("error", "An error occurred during registration");
    return res.redirect("back");
  }
});

router.post("/logger", (req, res) => {
  return res.send({ data: req.body });
});

// Fingerprint submission route
router.post("/submit-fingerprint", async (req, res) => {
  const fingerprintId = req.body.fingerprintData;
  console.log({ Data: parseInt(fingerprintId) });  

  const currentDate = new Date();

  if(req.body.fingerprintData){
    try {
      if (await prisma.fingerprintscans.findFirst({
        where: { fingerprintid: parseInt(fingerprintId) }
      })) {
        return res.status(201).send({ error: "Fingerprint already scanned!" });
      } else {
        await prisma.fingerprintscans.create({
          data: {
            fingerprintid: parseInt(fingerprintId),
            createdat: currentDate,
          },
        });
        return res.status(200).send({ success: "Fingerprint scan successful!" });
      }
    } catch (err) {
      console.error("Error storing fingerprintData: ");
      res.status(400).send({ error: "Couldn't process fingerprint" });
      throw new Error(err)
    }
  } else{
    console.error('Something went wrong: ', fingerprintId);
  }
});

// Get fingerprint ID route
router.get("/get-fingerprint-id", requireLogin, async (req, res) => {
  try {
    const latestScan = await prisma.fingerprintscans.findFirst({
      orderBy: {
        createdat: "desc",
      },
    });
    req.session.latestScanTime = latestScan.createdat;
    req.session.latestScanId = latestScan.fingerprintid;
    if (!latestScan) {
      console.log("No fingerprint scanned yet");
      return res.send(`  
          <label for="name">Name: </label>
          <input type="text" id="name" name="name" placeholder="Students Name" value="No fingerprint scanned yet" disabled/>
        `);
    } else {
      const student = await prisma.students.findFirst({
        where: { fingerprintid: latestScan.fingerprintid },
      });
      return res.send(`
        <label for="name">Name: </label>
        <input type="text" id="name" name="name" placeholder="Students Name" value="${student.name}"/>
      `);
    }
  } catch (err) {
    console.error("Error getting fingerprintData: ", err);
    req.flash("error", "Couldn't fetch fingerprint");
    return res.send(`
        <label for="name">Name: </label>
        <input type="text" id="name" name="name" placeholder="Students Name" value="Try Again!" disabled/>
      `);
  }
});

router.get("/select-modules", requireLogin, async (req, res) => {
  const _class = req.session.studentClass;
  const modules = await prisma.modules.findMany({
    where: {
      classid: _class,
    },
  });
  return res.render("pages/select-modules", {
    title: "Select Modules",
    modules: modules,
    links: navlinks.general,
  });
});

router.post("/register-student-modules", requireLogin, async (req, res) => {
  const modules = req.body;
  const selectedModules = Object.values(modules);
  try {
    /**
     * Creates many student-module associations in the database.
     *
     * This function takes an array of module IDs and associates them with the current student's ID stored in the session.
     * It uses the `prisma.student_module.createMany()` method to efficiently create multiple associations in a single database operation.
     *
     * @param {number[]} selectedModules - An array of module IDs to associate with the current student.
     * @returns {Promise<void>} - A Promise that resolves when the associations have been created.
     */
    selectedModules.map(async (moduleCode) => {
      await prisma.student_module.create({
        data: {
          registrationnumber: req.session.studentId,
          modulecode: moduleCode,
        },
      });
    });
    req.flash("success", "Modules registered successfully!");
    return res.redirect("/students");
  } catch (error) {
    req.flash("error", "Error registering modules");
    return res.redirect("back");
  }
});

router.get("/get-class", requireLogin, async (req, res) => {
  let classes = await prisma.classes.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    }
  });

  const teachersModules = await prisma.modules.findMany({
    where: { teacherid: req.session.teacherId }
  });

  for (const _module of teachersModules) {
    const enrolledClasses = await prisma.modules.findMany({
      where: {
        code: _module.code,
      },
      select: {
        classes: true
      }
    });

    enrolledClasses.forEach(enrolledClass => {
      classes.push(enrolledClass.classes);
    });
  }

  return res.render("pages/select-class", {
    title: "Select Class",
    links: navlinks.recordSession,
    classes,
  });
});

// session and attendance
router.post("/record-session", requireLogin, async (req, res) => {
  const currentDay = daysOfTheWeek[new Date().getDay()];
  const _class = await prisma.classes.findFirst({
    where: { name: req.body._class },
    include: { modules: true },
  });
  const currentDayLessons = await prisma.timetable.findMany({
    where: { day: currentDay },
  });
  // if (req.session.teacherId === undefined) {
  //   const teacherModules = await prisma.modules.findMany({
  //     where: { departmentcode: req.session.departmentcode },
  //   });
  // } else {
  //   const teacherModules = await prisma.modules.findMany({
  //     where: { teacherid: BigInt(req.session.teacherId) },
  //   });
  // }

  const classesModules = _class.modules.flat();

  // const matchingModules = classesModules.filter((classModule) =>
  //   teacherModules.some(
  //     (teacherModule) => teacherModule.teacherid === classModule.teacherid
  //   )
  // );

  req.session.classId = _class.id;

  return res.render("pages/session", {
    title: "Record new session",
    daysOfTheWeek,
    modules: classesModules,
    classId: _class.id,
    currentDayLessons,
    currentDay,
    links: navlinks.recordSession,
  });
});

router.post("/record-attendance", requireLogin, async (req, res) => {
  const data = req.body._module.split("-");
  const startTime = data[0];
  const endTime = data[1];
  const _module = data[2];
  const venue = data[3];

  const dateString = new Date().toISOString().split("T")[0];

  try {
    const lessonSession = await prisma.lessons.create({
      data: {
        date: dateString,
        starttime: startTime,
        endtime: endTime,
        classid: req.session.classId,
        modulecode: _module,
      },
    });
    req.session.lessonId = lessonSession.id;
    req.session.moduleCode = lessonSession.modulecode;
    req.flash("success", "Record attendance for new lesson!");
    return res.redirect("/record-attendance");
  } catch (error) {
    req.flash("error", "Internal Server Error!");
    res.status(502).redirect("back");
    throw new Error("Internal Server Error: ", error);
  }
});

router.get("/record-attendance", requireLogin, async (req, res) => {
  return res.render("pages/record-attendance", {
    title: "Record student attendance",
    links: navlinks.general,
  });
});

// Fingerprint scanning page route
router.get("/scan-fingerprint", requireLogin, (req, res) => {
  console.log(
    "Current fingerprint in session:",
    req.session.studentFingerprintId
  );
  res.render("pages/scan-fingerprint", {
    title: "Scan Fingerprint",
    links: navlinks.general,
  });
});

router.post("/assign-attendance", requireLogin, async (req, res) => {
  try {
    const student = await prisma.students.findFirst({
      where: { name: req.body.name },
    });
    if (student) {
      if (req.session.lessonId == undefined) {
        req.flash(
          "error",
          "Please select a lesson before recording attendance!"
        );
        res.redirect("/record-session");
      } else {
        try {
          const existingRecord = await prisma.attendance.findFirst({
            where: {
              fingerprintid: student.fingerprintid,
              lessonid: req.session.lessonId,
            },
          });
          if (!existingRecord) {
            await prisma.attendance.create({
              data: {
                lessonid: req.session.lessonId,
                fingerprintid: student.fingerprintid,
                present: true,
              },
            });
            req.flash("success", "Record entered successfully!");
            await prisma.fingerprintscans.delete({
              where: {
                createdat_fingerprintid: {
                  createdat: req.session.latestScanTime,
                  fingerprintid: req.session.latestScanId,
                },
              },
            });
            return res.redirect("back");
          } else {
            req.flash("error", "Attendance already recorded!");
            await prisma.fingerprintscans.delete({
              where: {
                createdat_fingerprintid: {
                  createdat: req.session.latestScanTime,
                  fingerprintid: req.session.latestScanId,
                },
              },
            });
            return res.redirect("back");
          }
        } catch (error) {
          req.flash("error", "Error entering record!");
          console.error(error);
          return res.redirect("back");
        }
      }
    } else {
      req.flash("error", "Student not found!");
      await prisma.fingerprintscans.delete({
        where: {
          createdat_fingerprintid: {
            createdat: req.session.latestScanTime,
            fingerprintid: req.session.latestScanId,
          },
        },
      });
      return res.redirect("back");
    }
  } catch (error) {
    req.flash("error", "Internal Server Error!");
    res.status(502).redirect("back");
    throw new Error("Internal Server error: ", error);
  }
});

router.get("/attendance/:module", requireLogin, async (req, res) => {
  const _module = req.params.module;

  const Module = await prisma.modules.findFirst({
    where: {
      code: _module,
    },
  });
  const moduleName = Module.name;
  // get module name

  const enrolledStudents = await prisma.student_module.findMany({
    where: {
      modulecode: Module.code,
    },
  });
  const enrolledStudentsPromises = enrolledStudents.map(
    async (enrolledStudent) => {
      const students = await prisma.students.findMany({
        where: {
          registrationnumber: enrolledStudent.registrationnumber,
        },
      });
      return students;
    }
  );

  const students = await Promise.all(enrolledStudentsPromises);
  // get all students who study this module

  const lessons = await prisma.lessons.findMany({
    where: {
      modulecode: Module.code,
    },
  }); // get all lessons recorded for this module

  const attendanceRecordsPromises = lessons.map(async (lesson) => {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        lessonid: lesson.id,
      },
    });
    return attendanceRecords;
  });

  const attendanceRecords = await Promise.all(attendanceRecordsPromises);

  return res.render("pages/attendance", {
    title: `Attendance record for ${moduleName} ${Module.code}`,
    students: students.flat(),
    lessons,
    attendanceRecords: attendanceRecords.flat(),
    links: navlinks.general,
  });
});

// back
router.get("/back", async (req, res) => {
  return res.redirect("back");
});

/**
 * Logs out the current user by destroying the session.
 *
 * @route GET /logout
 * @returns {Promise<void>} Redirects the user to the home page.
 */
// logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

export default router;
