import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "../api/router/router.js";

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/", router);

app.set('view engine', 'ejs')

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
