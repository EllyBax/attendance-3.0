import express from "express";
import flash from "connect-flash";
import session from "express-session";
import dotenv from "dotenv";
import pkg from "pg";
import argon from "argon2";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  query_timeout: 3400,
  connectionTimeoutMillis: 3500,
});

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
    return res.redirect("/");
  }
}

function requireHodLogin(req, res, next) {
  if (req.session.hodId) {
    next();
  } else {
    req.flash("error", "This page is only accessible by the admin!");
    return res.redirect("/");
  }
}

// home page
router.get("/", (req, res) => {
  res.render("pages/index", { title: "Welcome" });
});

router.get("/home", (req, res) => {
  if (req.session.sessionId) {
    res.redirect("/record-session");
  } else if (req.session.hodId) {
    res.redirect("/hod-index");
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
  });
});

router.post("/hod-login", async (req, res) => {
  const { email, password } = req.body;
  const existingHOD = await pool.query(`SELECT FROM "HOD" Where email = $1`, [
    email,
  ]);
  if (!existingHOD) {
    req.flash("error", "Invalid email!");
    return res.redirect("back");
  } else {
    const validPassword = await argon.verify(
      existingHOD.rows[0].password,
      password
    );
    if (validPassword) {
      req.session.departmentCode = existingHOD.departmentCode;
      req.session.sessionId = `${existingHOD.rows[0].departmentCode}-${existingHOD.id}`;
      req.session.hodId = `${existingHOD.rows[0].departmentCode}-${existingHOD.id}`;
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
  });
});

router.get("/new-hod", async (req, res) => {
  return res.render("pages/new-hod", {
    title: "Register HOD",
  });
});

router.post("/hod-registration", async (req, res) => {
  const hodData = req.body;
  let data = {
    name: hodData.name,
    email: hodData.email,
    phone: parseInt(hodData.phone),
    password: await argon.hash(hodData.password),
    departmentCode: hodData.departmentCode,
  };
  const hod = await pool.query(
    `ISERT INTO "HOD"(name, email, phone, password, departmentcode) values($1, $2, $3, $4, $5)`,
    [data.name, data.email, data.phone, data.password, data.departmentCode]
  );
  req.session.departmentCode = hod.departmentCode;
  req.session.sessionId = `${hod.departmentCode}-${hod.rows[0].id}`;
  req.session.hodId = `${hod.departmentCode}-${hod.rows[0].id}`;
  return res.redirect("/hod-index");
});

/**
 * Routes related to teacher functionality, including login, registration, and module management.
 */
// teachers routes
router.get("/record-session", (req, res) => {
  return res.send("pages/session", { title: "Record Attendance" });
});

router.get("/teachers", requireHodLogin, async (req, res) => {
  const teachers = await pool.query(
    `SELECT * FROM "TEACHERS" WHERE departmentcode = $1`,
    [req.session.departmentCode]
  );
  return res.render("pages/teachers", {
    title: "teachers page",
    teachers,
  });
});

router.get("/teacher-login", (req, res) => {
  return res.render("pages/teacher-login", {
    title: "Teacher Login",
  });
});

router.post("/teacher-login", async (req, res) => {
  const { id, password } = req.body;
  const existingTeacher = await pool.query(
    `Select * from "TEACHERS" where id = $1`,
    [id]
  );
  if (!existingTeacher) {
    req.flash("error", "User with this id doesn't exist");
    return res.redirect("back");
  } else {
    const validPassword = argon.verify(
      existingTeacher.rows[0].password,
      password
    );
    // await PasswordCtrl.verifyPassword(
    //   existingTeacher.rows[0].password,
    //   password
    // );
    if (validPassword) {
      req.session.sessionId = `${existingTeacher.rows[0].departmentCode}-${existingTeacher.rows[0].id}`;
      req.session.teacherId = existingTeacher.rows[0].id;
      req.session.departmentCode = existingTeacher.rows[0].departmentCode;
      req.flash("success", "Login Successful");
      return res.redirect(`/record-session`);
    } else {
      req.flash("error", "Invalid Password");
      return res.redirect("back");
    }
  }
});

router.get("/new-teacher", async (req, res) => {
  const departments = await pool.query(`SELECT * From "DEPARTMENT"`);
  return res.render("pages/new-teacher", {
    title: "new teacher page",
    departments: departments.rows,
  });
});

router.post("/teacher-registration", async (req, res) => {
  const { name, identificationNumber, departmentCode } = req.body;
  try {
    const teacher = await pool.query(
      `INSERT INTO "TEACHERS" (name, identificationnumber, departmentcode) values ($1, $2, $3)`,
      [name, identificationNumber, departmentCode]
    );
    console.log("Teacher created successfully!\n");
    req.flash("success", "Profile created successfully");
    req.session.sessionId = `${teacher.rows[0].departmentCode}-${teacher.rows[0].id}`;
    return res.redirect(`/teachers/${teacher.rows[0].id}`);
  } catch (err) {
    console.error("Error creating profile:", err);
    req.flash("error", "Error creating profile");
    return res.redirect("back");
  }
});

router.get("/teachers/:id", requireLogin, async (req, res) => {
  const id = req.params.id;
  const teacher = await pool.query(`SELECT * FROM "TEACHERS" WHERE id = $1`, [
    id,
  ]);
  const modules = await pool.query(
    `SELECT * FROM "MODULES" WHERE teacher_id = $1`,
    [id]
  );
  return res.render("pages/teacher-profile", {
    title: "Teacher Profile",
    teacher: teacher.rows[0],
    modules: modules.rows,
  });
});

/**
 * Fetches and renders a list of classes based on the department code stored in the session.
 *
 * @route GET /classes
 * @param {string} req.session.departmentCode - The department code to filter classes by.
 * @returns {Promise<void>} Renders the 'pages/classes' view with the fetched classes.
 */
// classes routes
router.get("/classes", requireHodLogin, async (req, res) => {
  const classes = await pool.query(
    `SELECT * FROM "CLASSES" WHERE departmentcode = $1`,
    [req.session.departmentCode]
  );
  return res.render("pages/classes", {
    title: "Classes page",
    classes: classes.rows,
  });
});

/**
 * Fetches and renders a list of modules based on the department code stored in the session.
 *
 * @route GET /modules
 * @param {string} req.session.departmentCode - The department code to filter modules by.
 * @returns {Promise<void>} Renders the 'pages/modules' view with the fetched modules.
 */
// modules routes
router.get("/modules", requireHodLogin, async (req, res) => {
  const modules = await pool.query(
    `SELECT * FROM "MODULES" WHERE departmentcode = $1`,
    [req.session.departmentCode]
  );
  return res.render("pages/modules", {
    title: "Modules page",
    modules: modules.rows,
  });
});

router.get("/modules/:className", requireHodLogin, async (req, res) => {
  const _class = req.params.className;
  const modules = await pool.query(`SELECT * FROM "MODULES" WHERE class = $1`, [
    _class,
  ]);
  return res.render("pages/class-modules", {
    title: "Modules page",
    modules: modules.rows,
    _class,
  });
});

/**
 * Fetches and renders a list of courses based on the department code stored in the session.
 *
 * @route GET /courses
 * @param {string} req.session.departmentCode - The department code to filter courses by.
 * @returns {Promise<void>} Renders the 'pages/courses' view with the fetched courses.
 */
// courses
router.get("/courses", requireHodLogin, async (req, res) => {
  const courses = await pool.query(
    `SELECT * FROM "COURSES" WHERE departmentcode = $1`,
    [req.session.departmentCode]
  );
  return res.render("pages/courses", {
    title: "courses",
    courses: courses.rows,
  });
});

// students
// router.get("/students", requireHodLogin, async (req, res) => {
//   let _class;
//   const students = await pool.query(`SELECT * FROM STUDENTS WHERE class = $1`, [
//     _class,
//   ]);
//   return res.render("pages/students", {
//     title: "Students",
//     students: students.rows,
//   });
// });

router.get("/new-student", requireHodLogin, async (req, res) => {
  return res.render("pages/new-student", { title: "Register Student" });
});

router.post("/student-registration", requireHodLogin, async (req, res) => {
  const { name, registrationNumber, fingerprintId, _class } = req.body;

  try {
    const student = await pool.query(
      `INSERT INTO "STUDENTS" (name, registrationnumber, fingerprintid, class) values ($1, $2, $3, $4)`,
      [name, registrationNumber, fingerprintId, _class]
    );
    req.flash("success", "Registration successful");
    req.session.studentId = student.rows[0].registrationnumber;
    req.session.studentClass = student.rows[0].class;
    return res.render("pages/select-modules", {
      title: "Select  your modules",
      student: student.rows[0],
    });
  } catch (error) {
    req.flash("error", "Registration failed!");
    return res.redirect("back");
  }
});

router.post("/register-student-modules", requireHodLogin, async (req, res) => {
  const modules = req.body;
  const selectedModules = Object.values(modules);
  try {
    selectedModules.forEach(async (selectedModule) => {
      const studentsModule = await pool.query(
        `INSERT INTO "STUDENT_MODULE" (registrationnumber, modulecode) values ($1, $2)`,
        [req.session.studentId, selectedModule]
      );
    });
    req.flash("success", "Modules registred successfully!");
    const students = await pool.query(
      `SELECT * FROM STUDENTS WHERE class = $1`,
      [req.session.studentClass]
    );
    return res.render("pages/students", {
      title: "Students",
      students: students.rows,
    });
  } catch (error) {
    req.flash("error", "Error registering modules");
    return res.redirect("back");
  }
});

// session and attendance
router.get("/record-session", requireLogin, async (req, res) => {
  const teacherModules = await pool.query(
    `SELECT * FROM "TEACHER_MODULE" WHERE teacherid = $1`,
    [req.session.teacherId]
  );
  const classes = await pool.query(
    `SELECT * FROM "CLASSES" WHERE departmentcode = $1`,
    [req.session.departmentCode]
  );
  return res.render("pages/session", {
    title: "Record new session",
    modules: teacherModules.rows,
    classes: classes.rows,
  });
});

router.post("/record-attendance", requireLogin, async (req, res) => {
  const { date, _class, _module, startTime, endTime } = req.body;
  const dateString = new Date(date).toISOString().split("T")[0];
  const startTimeString = startTime; // This is already a string
  const endTimeString = endTime; // This is already a string

  try {
    const lessonSession = await pool.query(
      `INSERT INTO "SESSION" (date, class, modulecode, starttime, endtime) values ($1,$2,$3,$4,$5)`,
      [dateString, _class, _module, startTimeString, endTimeString]
    );
    req.session.lessonId = lessonSession.rows[0].id;
    req.flash("success", "Record attendance for new session!");
    return res.render("pages/record-attendance", {
      title: "Record student attendance",
    });
  } catch (error) {
    req.flash("error", "Error creating session");
    return res.redirect("back");
  }
});

router.post("/assign-attendance", requireLogin, async (req, res) => {
  const fingerprintId = req.body.fingerprint;
  try {
    const studentRecord = await pool.query(
      `insert into "ATTENDANCE" (sessionid, fingerprintid) values ($1, $2)`,
      [req.session.lessonId, fingerprintId]
    );
    req.flash("success", "Record entered successfully!");
    return res.redirect("back");
  } catch (error) {
    req.flash("error", "Error entering record!");
    return res.redirect("back");
  }
});

router.get("/attendance/:module", requireLogin, async (req, res) => {
  const _module = req.params.module;

  const moduleName = await pool.query(
    `SELECT name FROM "MODULE" WHERE code = $1`,
    [_module]
  ); // get module name

  const students = await pool.query(
    `SELECT * FROM "STUDENT_MODULE" WHERE modulecode = $1`,
    [_module]
  ); // get all students who study this module

  const lessons = await pool.query(
    `SELECT * FROM "SESSION" WHERE modulecode = $1`,
    [_module]
  ); // get all lessons recorded for this module

  const attendanceRecordsPromises = lessons.rows.map(async (lesson) => {
    const attendanceRecords = await pool.query(
      `SELECT * FROM "ATTENDANCE" WHERE sessionid = $1`,
      [lesson.id]
    );
    return attendanceRecords.rows;
  });

  const attendanceRecords = await Promise.all(attendanceRecordsPromises);

  return res.render("pages/attendance", {
    title: `Attendance record for ${moduleName.rows[0].name}`,
    students: students.rows,
    lessons: lessons.rows,
    attendanceRecords: attendanceRecords.flat(),
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
