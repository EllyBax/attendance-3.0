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
    { url: "/record-session", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
  newStudent: [
    { url: "/home", name: "Home" },
    { url: "/new-teacher", name: "New Teacher" },
    { url: "/record-session", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
  newTeacher: [
    { url: "/home", name: "home" },
    { url: "/new-student", name: "New Student" },
    { url: "/record-session", name: "Record Attendance" },
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
    { url: "/record-session", name: "Record Attendance" },
    { url: "/logout", name: "Logout" },
  ],
};

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

// home page
router.get("/", (req, res) => {
  res.render("pages/index", { title: "Welcome", links: navlinks.index });
});

router.get("/home", (req, res) => {
  if (req.session.hodId) {
    res.redirect("/hod-index");
  } else if (req.session.sessionId) {
    res.redirect("/record-session");
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
  const hod = await prisma.hod.create({
    data: data,
  });
  req.session.departmentcode = hod.departmentcode;
  req.session.sessionId = `${hod.departmentcode}-${hod.id}`;
  req.session.hodId = `${hod.departmentcode}-${hod.id}`;
  return res.redirect("/hod-index");
});

/**
 * Routes related to teacher functionality, including login, registration, and module management.
 */
// teachers routes
router.get("/record-session", requireLogin, async (req, res) => {
  const classes = await prisma.classes.findMany({
    where: { departmentcode: req.session.departmentcode },
  });
  const modules = await prisma.modules.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });
  return res.render("pages/session", {
    title: "Record Attendance",
    classes,
    modules,
    links: navlinks.recordSession,
  });
});

router.get("/teachers", requireHodLogin, async (req, res) => {
  const modules = await prisma.modules.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });

  const teachersPromise = await modules.map(async (_module) => {
    const teachers = await prisma.teachers.findMany({
      where: {
        identificationnumber: _module.teacherid,
      },
    });
    return teachers;
  });

  const teachers = await Promise.all(teachersPromise);

  return res.render("pages/teachers", {
    title: "teachers page",
    teachers: teachers.flat(),
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
      req.session.sessionId = `${existingTeacher.departmentcode}-${existingTeacher.id}`;
      req.session.teacherId = existingTeacher.id;
      req.session.departmentcode = existingTeacher.departmentcode;
      req.flash("success", "Login Successful");
      return res.redirect(`/record-session`);
    } else {
      req.flash("error", "Invalid Password");
      return res.redirect("back");
    }
  }
});

router.get("/new-teacher", async (req, res) => {
  const departments = await prisma.department.findMany();
  return res.render("pages/new-teacher", {
    title: "new teacher page",
    departments: departments,
    links: navlinks.newTeacher,
  });
});

router.post("/teacher-registration", async (req, res) => {
  const { name, identificationNumber, departmentcode } = req.body;
  try {
    const teacher = await prisma.teachers.create({
      data: {
        identificationnumber: identificationNumber,
        name: name,
        departmentcode: departmentcode,
        password: password,
      },
    });
    console.log("Teacher created successfully!\n");
    req.flash("success", "Profile created successfully");
    req.session.sessionId = `${teacher.departmentcode}-${teacher.id}`;
    return res.redirect(`/teachers/${teacher.id}`);
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
router.get("/students", requireHodLogin, async (req, res) => {
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

router.get("/new-student", requireHodLogin, async (req, res) => {
  const classes = await prisma.classes.findMany();
  return res.render("pages/new-student", {
    title: "Register Student",
    classes,
    links: navlinks.newStudent,
  });
});

router.post("/student-registration", requireHodLogin, async (req, res) => {
  const { name, registrationNumber, fingerprintId, _class } = req.body;
  console.log(String(registrationNumber));
  const _classid = await prisma.classes.findFirst({
    where: {
      name: _class,
    },
    select: { id: true },
  });

  try {
    const student = await prisma.students.create({
      data: {
        name,
        registrationnumber: String(registrationNumber),
        fingerprintid: fingerprintId,
        classid: _classid.id,
      },
    });
    req.flash("success", "Registration successful");
    req.session.studentId = student.registrationnumber;
    req.session.studentClass = student.classid;

    return res.redirect("/select-modules");
  } catch (error) {
    console.error(error);
    req.flash("error", "Registration failed!");
    // throw new Error(error);
    return res.redirect("back");
  }
});

router.get("/select-modules", requireHodLogin, async (req, res) => {
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

router.post("/register-student-modules", requireHodLogin, async (req, res) => {
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

// session and attendance
router.get("/record-session", requireLogin, async (req, res) => {
  const teacherModules = await prisma.modules.findMany({
    where: { teacherid: req.session.teacherId },
  });
  const classes = await prisma.classes.findMany({
    where: {
      departmentcode: req.session.departmentcode,
    },
  });
  return res.render("pages/session", {
    title: "Record new session",
    modules: teacherModules,
    classes,
    links: navlinks.recordSession,
  });
});

router.post("/record-attendance", requireLogin, async (req, res) => {
  const { date, _class, _module, startTime, endTime } = req.body;
  const dateString = new Date(date).toISOString().split("T")[0];
  const startTimeString = startTime; // This is already a string
  const endTimeString = endTime; // This is already a string

  const classId = await prisma.classes.findFirst({
    where: { name: _class },
    select: { id: true },
  });

  try {
    const lessonSession = await prisma.lessons.create({
      data: {
        date: dateString,
        starttime: startTimeString,
        endtime: endTimeString,
        classid: classId.id,
        modulecode: _module,
      },
    });
    req.session.lessonId = lessonSession.id;
    req.session.moduleCode = lessonSession.modulecode;
    req.flash("success", "Record attendance for new lesson!");
    return res.redirect("/record-attendance");
  } catch (error) {
    req.flash("error", "Error creating lesson");
    throw new Error(error);
    // return res.redirect("back");
  }
});

router.get("/record-attendance", requireLogin, async (req, res) => {
  return res.render("pages/record-attendance", {
    title: "Record student attendance",
    links: navlinks.general,
  });
});

router.post("/assign-attendance", requireLogin, async (req, res) => {
  const fingerprintId = req.body.fingerprint;
  const student = await prisma.students.findFirst({
    where: { fingerprintid: fingerprintId },
  });
  if (student) {
    try {
      const existingRecord = await prisma.attendance.findFirst({
        where: {
          fingerprintid: fingerprintId,
          lessonid: req.session.lessonId,
        },
      });
      if (!existingRecord) {
        const studentRecord = await prisma.attendance.create({
          data: {
            lessonid: req.session.lessonId,
            fingerprintid: fingerprintId,
            present: true,
          },
        });
        req.flash("success", "Record entered successfully!");
        return res.redirect("back");
      } else {
        req.flash("error", "Attendance already recorded!");
        return res.redirect("back");
      }
    } catch (error) {
      req.flash("error", "Error entering record!");
      console.error(error);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Student not found!");
    return res.redirect("back");
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
    title: `Attendance record for ${moduleName}`,
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
