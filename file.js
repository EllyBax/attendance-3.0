import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// const modulesArray = [
//   {
//     code: "GSU 08211",
//     name: "Entrepreneurship",
//     teacherid: 20240102,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "ETU 08221",
//     name: "Project",
//     teacherid: 20240103,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "ETU 08222",
//     name: "Radar",
//     teacherid: 20240107,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "ETU 08223",
//     name: "Broadcasting",
//     teacherid: 20240104,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "ETU 08224",
//     name: "Satellite",
//     teacherid: 20240105,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "COU 08202",
//     name: "Robotics",
//     teacherid: 20240106,
//     departmentcode: "ETE",
//     classid: 253,
//   },
//   {
//     code: "ETU 07202",
//     name: "Antenna",
//     teacherid: 20240101,
//     departmentcode: "ETE",
//     classid: 253,
//   }
// ];

// modulesArray.forEach(async (module) => {
//   await prisma.modules.create({
//     data: module,
//   });
//   console.log("Created module: ", module.name);
// });

const timetable = await prisma.timetable.createMany({
  data: [
    {
      day: "Monday",
      classid: 253,
      modulecode: "GSU 08211",
      starttime: "09:00",
      endtime: "11:00",
    },
    {
      day: "Monday",
      classid: 253,
      modulecode: "ETU 08222",
      starttime: "12:00",
      endtime: "15:00",
    },
    {
      day: "Tuesday",
      classid: 253,
      modulecode: "ETU 08224",
      starttime: "08:00",
      endtime: "11:00",
    },
    {
      day: "Tuesday",
      classid: 253,
      modulecode: "COU 08202",
      starttime: "12:00",
      endtime: "14:00",
    },
    {
      day: "Wednesday",
      classid: 253,
      modulecode: "ETU 08221",
      starttime: "10:00",
      endtime: "13:00",
    },
    {
      day: "Wednesday",
      classid: 253,
      modulecode: "COU 08202",
      starttime: "14:00",
      endtime: "253:00",
    },
    {
      day: "Thursday",
      classid: 253,
      modulecode: "ETU 08223",
      starttime: "08:00",
      endtime: "11:00",
    },
    {
      day: "Thursday",
      classid: 253,
      modulecode: "ETU 08224",
      starttime: "12:00",
      endtime: "14:00",
    },
    {
      day: "Thursday",
      classid: 253,
      modulecode: "ETU 08222",
      starttime: "15:00",
      endtime: "18:00",
    },
    {
      day: "Friday",
      classid: 253,
      modulecode: "COU 08202",
      starttime: "07:00",
      endtime: "10:00",
    },
    {
      day: "Friday",
      classid: 253,
      modulecode: "GSU 08211",
      starttime: "12:00",
      endtime: "14:00",
    },
  ],
});

console.log(timetable);

console.log("\ndone");


// comments

// const classes = await prisma.classes.createMany({
//   data:[
//     { name: "BENG21 LT", departmentcode: "LT" },
//     { name: "BENG22 LT", departmentcode: "LT" },
//     { name: "BENG23 LT", departmentcode: "LT" },
//     { name: "BENG24 LT", departmentcode: "LT" },
//     { name: "BENG21 COE", departmentcode: "CS" },
//     { name: "BENG22 COE", departmentcode: "CS" },
//     { name: "BENG23 COE", departmentcode: "CS" },
//     { name: "BENG24 COE", departmentcode: "CS" },
//     { name: "BENG21 MNE", departmentcode: "CE" },
//     { name: "BENG22 MNE", departmentcode: "CE" },
//     { name: "BENG23 MNE", departmentcode: "CE" },
//     { name: "BENG24 MNE", departmentcode: "CE" },
//     { name: "BENG21 EE", departmentcode: "EE" },
//     { name: "BENG22 EE", departmentcode: "EE" },
//     { name: "BENG23 EE", departmentcode: "EE" },
//     { name: "BENG24 EE", departmentcode: "EE" },
//     { name: "BENG21 CS", departmentcode: "CS" },
//     { name: "BENG22 CS", departmentcode: "CS" },
//     { name: "BENG23 CS", departmentcode: "CS" },
//     { name: "BENG24 CS", departmentcode: "CS" },
//     { name: "BENG21 BIT", departmentcode: "BIT" },
//     { name: "BENG22 BIT", departmentcode: "BIT" },
//     { name: "BENG23 BIT", departmentcode: "BIT" },
//     { name: "BENG24 BIT", departmentcode: "BIT" },
//     { name: "BENG21 CE", departmentcode: "CE" },
//     { name: "BENG22 CE", departmentcode: "CE" },
//     { name: "BENG23 CE", departmentcode: "CE" },
//     { name: "BENG24 CE", departmentcode: "CE" },
//     { name: "BENG21 ETE", departmentcode: "ETE" },
//     { name: "BENG22 ETE", departmentcode: "ETE" },
//     { name: "BENG23 ETE", departmentcode: "ETE" },
//     { name: "BENG24 ETE", departmentcode: "ETE" },
//     { name: "OD21 LT", departmentcode: "LT" },
//     { name: "OD22 LT", departmentcode: "LT" },
//     { name: "OD23 LT", departmentcode: "LT" },
//     { name: "OD24 LT", departmentcode: "LT" },
//     { name: "OD21 COE", departmentcode: "CS" },
//     { name: "OD22 COE", departmentcode: "CS" },
//     { name: "OD23 COE", departmentcode: "CS" },
//     { name: "OD24 COE", departmentcode: "CS" },
//     { name: "OD21 MNE", departmentcode: "CE" },
//     { name: "OD22 MNE", departmentcode: "CE" },
//     { name: "OD23 MNE", departmentcode: "CE" },
//     { name: "OD24 MNE", departmentcode: "CE" },
//     { name: "OD21 EE", departmentcode: "EE" },
//     { name: "OD22 EE", departmentcode: "EE" },
//     { name: "OD23 EE", departmentcode: "EE" },
//     { name: "OD24 EE", departmentcode: "EE" },
//     { name: "OD21 IT", departmentcode: "CS" },
//     { name: "OD22 IT", departmentcode: "CS" },
//     { name: "OD23 IT", departmentcode: "CS" },
//     { name: "OD24 IT", departmentcode: "CS" },
//     { name: "OD21 BIT", departmentcode: "BIT" },
//     { name: "OD22 BIT", departmentcode: "BIT" },
//     { name: "OD23 BIT", departmentcode: "BIT" },
//     { name: "OD24 BIT", departmentcode: "BIT" },
//     { name: "OD21 CE", departmentcode: "CE" },
//     { name: "OD22 CE", departmentcode: "CE" },
//     { name: "OD23 CE", departmentcode: "CE" },
//     { name: "OD24 CE", departmentcode: "CE" },
//     { name: "OD21 ETE", departmentcode: "ETE" },
//     { name: "OD22 ETE", departmentcode: "ETE" },
//     { name: "OD23 ETE", departmentcode: "ETE" },
//     { name: "OD24 ETE", departmentcode: "ETE" },
//     { name: "OD21 CST", departmentcode: "ETE" },
//     { name: "OD22 CST", departmentcode: "ETE" },
//     { name: "OD23 CST", departmentcode: "ETE" },
//     { name: "OD24 CST", departmentcode: "ETE" },
//     { name: "OD21 MFT", departmentcode: "CS" },
//     { name: "OD22 MFT", departmentcode: "CS" },
//     { name: "OD23 MFT", departmentcode: "CS" },
//     { name: "OD24 MFT", departmentcode: "CS" },
//     { name: "OD21 RET", departmentcode: "EE" },
//     { name: "OD22 RET", departmentcode: "EE" },
//     { name: "OD23 RET", departmentcode: "EE" },
//     { name: "OD24 RET", departmentcode: "EE" },
//     { name: "OD21 BEE", departmentcode: "EE" },
//     { name: "OD22 BEE", departmentcode: "EE" },
//     { name: "OD23 BEE", departmentcode: "EE" },
//     { name: "OD24 BEE", departmentcode: "EE" },
// ]
// });
// console.log(classes);

// const department = await prisma.department.createMany({
//   data: [
//     {
//       code: "ETE",
//       name: "Electronics and Telecommunication Engineering",
//     },
//     {
//       code: "CS",
//       name: "Computer Studies",
//     },
//     {
//       code: "EE",
//       name: "Electrical Engineering",
//     },
//     {
//       code: "LT",
//       name: "Laboratory Technology",
//     },
//     {
//       code: "BIT",
//       name: "Biotechnology",
//     },
//     {
//       code: "MNE",
//       name: "Mining Engineering",
//     },
//     {
//       code: "CE",
//       name: "Civil Engineering",
//     },
//     {
//       code: "GS",
//       name: "General Studies",
//     },
//   ],
// });
// console.log(department);

// // // const timetable = {
// // //   day: "",
// // //   classid: 253,
// // //   moduleCode: "",
// // //   startTime: "",
// // //   endTime: "",
// // // }