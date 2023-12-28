import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userrouter from './routes/user.route.js'

//route declaration
app.use("/users",userrouter)

//http://localhost:3000/api/v1/users/register
export {app}