// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// // const modulesArray = [
// //   {
// //     code: "GSU 08211",
// //     name: "Entrepreneurship",
// //     teacherid: 712326124,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// //   {
// //     code: "ETU 08221",
// //     name: "Project",
// //     teacherid: 712324498,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// //   {
// //     code: "ETU 08222",
// //     name: "Radar",
// //     teacherid: 724498124,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// //   {
// //     code: "ETU 08223",
// //     name: "Broadcasting",
// //     teacherid: 712324906,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// //   {
// //     code: "ETU 08224",
// //     name: "Satellite",
// //     teacherid: 712306124,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// //   {
// //     code: "COU 08202",
// //     name: "Robotics",
// //     teacherid: 712324456,
// //     departmentcode: "ETE",
// //     classid: 5,
// //   },
// // ];

// // modulesArray.forEach(async (module) => {
// //   await prisma.modules.create({
// //     data: module,
// //   });
// //   console.log("Created module: ", module.name);
// // });

// // const classes = await prisma.classes.createMany({
// //   data: [
// //     { name: "BENG20 COE", departmentcode: "CS" },
// //     { name: "BENG21 COE", departmentcode: "CS" },
// //     { name: "BENG22 COE", departmentcode: "CS" },
// //     { name: "BENG23 COE", departmentcode: "CS" },
// //     { name: "BENG20 ETE", departmentcode: "ETE" },
// //     { name: "BENG21 ETE", departmentcode: "ETE" },
// //     { name: "BENG22 ETE", departmentcode: "ETE" },
// //     { name: "BENG23 ETE", departmentcode: "ETE" },
// //     { name: "BENG20 LT", departmentcode: "LT" },
// //     { name: "BENG21 LT", departmentcode: "LT" },
// //     { name: "BENG22 LT", departmentcode: "LT" },
// //     { name: "BENG23 LT", departmentcode: "LT" },
// //   ],
// // });
// // console.log(classes);

// // const department = await prisma.department.createMany({
// //   data: [
// //     {
// //       code: "ETE",
// //       name: "Electronics and Telecommunication Engineering",
// //     },
// //     {
// //       code: "CS",
// //       name: "Computer Studies",
// //     },
// //     {
// //       code: "EE",
// //       name: "Electrical Engineering",
// //     },
// //     {
// //       code: "LT",
// //       name: "Laboratory Technology",
// //     },
// //     {
// //       code: "BIT",
// //       name: "Biotechnology",
// //     },
// //     {
// //       code: "MNE",
// //       name: "Mining Engineering",
// //     },
// //     {
// //       code: "CE",
// //       name: "Civil Engineering",
// //     },
// //     {
// //       code: "GS",
// //       name: "General Studies",
// //     },
// //   ],
// // });
// // console.log(department);

// // const  teachers = await prisma.teachers.createMany({
// //   data: [
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 1234567890,
// //     "departmentcode": "ETE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324456,
// //     "departmentcode": "CS",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 712326124,
// //     "departmentcode": "CS",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324498,
// //     "departmentcode": "BIT",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 724498124,
// //     "departmentcode": "BIT",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324906,
// //     "departmentcode": "CE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 712306124,
// //     "departmentcode": "CE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324206,
// //     "departmentcode": "ETE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 71232124,
// //     "departmentcode": "ETE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 712342356,
// //     "departmentcode": "EE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712322356,
// //     "departmentcode": "EE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324676,
// //     "departmentcode": "MNE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 714676124,
// //     "departmentcode": "MNE",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "John Doe",
// //     "identificationnumber": 712324326,
// //     "departmentcode": "LT",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   },
// //   {
// //     "name": "Jane Doe",
// //     "identificationnumber": 712324724,
// //     "departmentcode": "LT",
// //     "password": "$argon2id$v=19$m=65536,t=3,p=4$HscOLqLOBZOiyxWcVP/62w$hjHYcmlYmRiq+d2Um+nO2sZ3UfGljIWsefcMWI/U6Lg"
// //   }
// // ]
// // })

// // console.log(teachers);


// const teachers = await prisma.teachers.createMany({
//   data: [
//     {
//       "name": "Mr. Majogoro",
//       "identificationnumber": 712326124,
//       "departmentcode": "ETE",
//       "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
//     },
//     {
//       "name": "Mr. Kajange",
//       "identificationnumber": 712324498,
//       "departmentcode": "ETE",
//       "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
//     },
//     {
//       "name": "Mr. Ally J",
//       "identificationnumber": 724498124,
//       "departmentcode": "ETE",
//       "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
//     },
//     {
//       "name": "Madam Justina",
//       "identificationnumber": 712306124,
//       "departmentcode": "ETE",
//       "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
//     },
//     {
//       "name": "Dr. Simbeye",
//       "identificationnumber": 712324456,
//       "departmentcode": "ETE",
//       "password": "$argon2id$v=19$m=65536,t=3,p=4$3Pqc00YURTaJEdjNEMIt5A$P41MdwmE4ePUunSzr/A8DJ8HiYwN7CsxVXfQ2Hqn4Vs"
//     }
//   ]
// })

// console.log(teachers);
