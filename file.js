import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// const modulesArray = [
//   {
//     code: "GSU 08211",
//     name: "Entrepreneurship",
//     teacherid: 20240102,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "ETU 08221",
//     name: "Project",
//     teacherid: 20240103,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "ETU 08222",
//     name: "Radar",
//     teacherid: 20240107,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "ETU 08223",
//     name: "Broadcasting",
//     teacherid: 20240104,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "ETU 08224",
//     name: "Satellite",
//     teacherid: 20240105,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "COU 08202",
//     name: "Robotics",
//     teacherid: 20240106,
//     departmentcode: "ETE",
//     classid: 17,
//   },
//   {
//     code: "ETU 07202",
//     name: "Antenna",
//     teacherid: 20240101,
//     departmentcode: "ETE",
//     classid: 18,
//   }
// ];

// modulesArray.forEach(async (module) => {
//   await prisma.modules.create({
//     data: module,
//   });
//   console.log("Created module: ", module.name);
// });

// const classes = await prisma.classes.createMany({
//   data: [
//     { name: "BENG20 COE", departmentcode: "CS" },
//     { name: "BENG21 COE", departmentcode: "CS" },
//     { name: "BENG22 COE", departmentcode: "CS" },
//     { name: "BENG23 COE", departmentcode: "CS" },
//     { name: "BENG20 ETE", departmentcode: "ETE" },
//     { name: "BENG21 ETE", departmentcode: "ETE" },
//     { name: "BENG22 ETE", departmentcode: "ETE" },
//     { name: "BENG23 ETE", departmentcode: "ETE" },
//     { name: "BENG20 LT", departmentcode: "LT" },
//     { name: "BENG21 LT", departmentcode: "LT" },
//     { name: "BENG22 LT", departmentcode: "LT" },
//     { name: "BENG23 LT", departmentcode: "LT" },
//   ],
// });
// console.log(classes);

// // // const department = await prisma.department.createMany({
// // //   data: [
// // //     {
// // //       code: "ETE",
// // //       name: "Electronics and Telecommunication Engineering",
// // //     },
// // //     {
// // //       code: "CS",
// // //       name: "Computer Studies",
// // //     },
// // //     {
// // //       code: "EE",
// // //       name: "Electrical Engineering",
// // //     },
// // //     {
// // //       code: "LT",
// // //       name: "Laboratory Technology",
// // //     },
// // //     {
// // //       code: "BIT",
// // //       name: "Biotechnology",
// // //     },
// // //     {
// // //       code: "MNE",
// // //       name: "Mining Engineering",
// // //     },
// // //     {
// // //       code: "CE",
// // //       name: "Civil Engineering",
// // //     },
// // //     {
// // //       code: "GS",
// // //       name: "General Studies",
// // //     },
// // //   ],
// // // });
// // // console.log(department);

// // // const timetable = {
// // //   day: "",
// // //   classid: 17,
// // //   moduleCode: "",
// // //   startTime: "",
// // //   endTime: "",
// // // }

// const timetable = await prisma.timetable.createMany({
//   data: [
//     {
//       day: "Monday",
//       classid: 17,
//       modulecode: "GSU 08211",
//       starttime: "09:00",
//       endtime: "11:00",
//     },
//     {
//       day: "Monday",
//       classid: 17,
//       modulecode: "ETU 08222",
//       starttime: "12:00",
//       endtime: "15:00",
//     },
//     {
//       day: "Tuesday",
//       classid: 17,
//       modulecode: "ETU 08224",
//       starttime: "08:00",
//       endtime: "11:00",
//     },
//     {
//       day: "Tuesday",
//       classid: 17,
//       modulecode: "COU 08202",
//       starttime: "12:00",
//       endtime: "14:00",
//     },
//     {
//       day: "Wednesday",
//       classid: 17,
//       modulecode: "ETU 08221",
//       starttime: "10:00",
//       endtime: "13:00",
//     },
//     {
//       day: "Wednesday",
//       classid: 17,
//       modulecode: "COU 08202",
//       starttime: "14:00",
//       endtime: "17:00",
//     },
//     {
//       day: "Thursday",
//       classid: 17,
//       modulecode: "ETU 08223",
//       starttime: "08:00",
//       endtime: "11:00",
//     },
//     {
//       day: "Thursday",
//       classid: 17,
//       modulecode: "ETU 08224",
//       starttime: "12:00",
//       endtime: "14:00",
//     },
//     {
//       day: "Thursday",
//       classid: 17,
//       modulecode: "ETU 08222",
//       starttime: "15:00",
//       endtime: "18:00",
//     },
//     {
//       day: "Friday",
//       classid: 17,
//       modulecode: "COU 08202",
//       starttime: "07:00",
//       endtime: "10:00",
//     },
//     {
//       day: "Friday",
//       classid: 17,
//       modulecode: "GSU 08211",
//       starttime: "12:00",
//       endtime: "14:00",
//     },
//   ],
// });

// console.log(timetable);
