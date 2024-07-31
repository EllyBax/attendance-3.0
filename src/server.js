import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import router from "../api/router/router.js";

dotenv.config();

// const port = process.env.PORT || 8080;
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static("public"));
// app.use("/", router);

// app.set("view engine", "ejs");

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

let prisma;

async function connectToDatabase() {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      prisma = new PrismaClient();
      await prisma.$connect();
      console.log("Connected to the database.");
      break;
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed to connect to the database. Retrying...`
      );
      if (attempt >= maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } // Wait 2 seconds before retrying
  }
}

async function startServer() {
  await connectToDatabase();
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");
  app.use("/", router);

  const PORT = process.env.PORT || 4321;
  app
    .listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    })
    .on("error", (err) => console.error(err));
}

startServer().catch(console.error);
