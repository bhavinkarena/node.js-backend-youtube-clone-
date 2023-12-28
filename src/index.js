// require("dotenv").config({path:'./env'});
import dotenv from "dotenv";
import connectDB from "./db/database.js";
// import express from "express";
// const apps = express()
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is start is started at ${process.env.PORT}`)
    })
})





/*(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",()=>{
         console.log("error")
         throw err
       })
       app.listen(process.env.PORT,()=>{
             console.log(`app is listening on port ${process.env.PORT}`)
       })
    } 
    catch (error) {
        console.log(error)
        throw err;
    }
})()*/