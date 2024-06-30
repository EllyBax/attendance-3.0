import express from "express";
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
