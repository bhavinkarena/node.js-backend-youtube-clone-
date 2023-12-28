//access tocken is limited when it is expire then refresh token are refresh the access token for work to login to user (this work doing for some sesion)

import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js"
import { uploadoncloudinary } from "../utils/fileupload.js";
import { Apiresponse } from "../utils/apiresponce.js";
import jwt from "jsonwebtoken";

const genrateaccessrefereshtoken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accesstoken = user.genrateaccesstoken()
        const refreshtoken = user.genraterefreshtoken()

        user.refreshtoken = refreshtoken
        await user.save({validateBeforeSave:false})

        return {accesstoken,refreshtoken}

    } catch (error) {
        throw new ApiError(500,"something wrong refresh token")
    }
}

const registeruser = asynchandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check user alreddy exits  :  username or email
    //check for images and avtar
    //upload to cloudinery,avtar
    //create user object - create entry in db
    //remove password and refresh token
    //check for user creation
    //return res


    const { fullname, email, username, password } = req.body
    console.log("Email", email)

    if (fullname === "") {
        throw new ApiError(400, "fullname is require")
    }
    if (email === "") {
        throw new ApiError(400, "email is require")
    }
    if (username === "") {
        throw new ApiError(400, "username is require")
    }
    if (password === "") {
        throw new ApiError(400, "password is require")
    }
    if (email.includes("@")) {
        console.log("Email is valid");
    }
    else {
        console.log("Email is not valid");
    }

    const exesteduser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if(exesteduser){
        throw new ApiError(409,"User with email or username are exists")
    }

    const avtarlp = req.files?.avtar[0]?.path
    // const coverimagelp = req.files?.coverimage[0]?.path
    let coverimagelp;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
        coverimagelp = req.files.coverimage[0].path
    }

    if(!avtarlp){
        throw new ApiError(400,"avtar is require")
    }

    const avtar = await uploadoncloudinary(avtarlp)
    const coverimage = await uploadoncloudinary(coverimagelp)

    if(!avtar){
        throw new ApiError(400,"avtar is require")
    }

   const user = await User.create({
        fullname,
        avtar:avtar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()    
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if(!createduser){
        throw new ApiError(500,"something went wrong")
    }
    return res.status(201).json(
        new Apiresponse(200,createduser,"user register successfully")
    )
});

const loginuser = asynchandler(async(req,res)=>{
     // req body -> data
     // username or email
     //find the user
     //password check
     //access and referess token
     //send cookie

     const {email,username,password} = req.body
     console.log(email)
     if(!(username || email)){
        throw new ApiError(400,"username and password require")
     }

     const user = await User.findOne({
        $or:[{username},{email}]
     })   //findone mongoose method

     if(!user){
        throw new ApiError(404,"user dose not exiset")
     }

    const ispassvalid = await user.isPasswordCorrect(password)

    if(!ispassvalid){
        throw new ApiError(401,"wrong password")
     }

    const {accesstoken,refreshtoken} = await genrateaccessrefereshtoken(user._id)

    const loggedinuer = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(new Apiresponse(200,{
        user:loggedinuer,accesstoken,refreshtoken
    },"user loggedin successfully"))
})

const logoutuser = asynchandler(async(req,res)=>{
    if (!req.user) {
        return res.status(401).json(new Apiresponse(401, {}, "User not authenticated"));
      }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshtoken:undefined}
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(new Apiresponse(200,{},"User logout succsessfully"))
})

const refreshaccesstoken = asynchandler(async(req,res)=>{
   const incomigrstoken = req.cookies.refreshtoken || req.body.refreshtoken

   if(!incomigrstoken){
    throw new ApiError(401,"unathorize request")
   }

  try {
     const decodetoken = jwt.verify(incomigrstoken,process.env.REFRESH_TOKEN_SECRET)
  
     const user = await User.findById(decodetoken?._id)
  
     if(!user){
      throw new ApiError(401,"invalid token")
     }
  
     if(incomigrstoken !== user?.refreshtoken){
      throw new ApiError(401,"not match")
     }
  
     const options = {
      httpOnly:true,
      secure:true
     }
  
     const{ac,rc} = await genrateaccessrefereshtoken(user._id)
  
     res.status(200)
     .cookie("accesstoken",ac,options)
     .cookie("refreshtoken",rc,options)
     .json(new Apiresponse(200,{accesstoken:ac,refreshtoken:rc},"access token are refresh succesfully"))
  } catch (error) {
    throw new ApiError(400,"not genrated")
  }
})

const changecurrentpassword = asynchandler(async(req,res)=>{
     const {oldpass,newpass} = req.body
     const user = await User.findById(req.user?._id)
    const passcorect = await user.isPasswordCorrect(oldpass)
    if(!passcorect){
        throw new ApiError(400,"incorect pass")
    }
    user.password=newpass
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new Apiresponse(200,{},"password change succsesfully"))
})

const getcurrentuser = asynchandler(async(req,res)=>{
    return res.status(200)
    .json(new Apiresponse(200,req.user,"current user fatch succesfully"))
})

const updateaccountdetail = asynchandler(async(req,res)=>{
    const {fullname,email} = req.body

    if(!fullname || !email){
        throw new ApiError(401,"field requered")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{fullname:fullname,email:email}
    },{new:true}).select("-password")

    res.status(200)
    .json(new Apiresponse (200,user,"account detail updated succesfully"))
})

const updateuseravtar = asynchandler(async(req,res)=>{
   const avtarlp = req.file?.path
   if(!avtarlp){
    throw new ApiError(401,"avtar not find")
   }

   const avtar =await uploadoncloudinary(avtarlp)

   if(!avtar.url){
    throw new ApiError(401,"avtar not upload")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,{
          $set:{avtar:avtar.url}
   },{new:true}).select("-password")
   
   res.status(200)
   .json(new Apiresponse (200,user,"avtar updated succesfully"))

})

const updateusercoverimage = asynchandler(async(req,res)=>{
   const coverimagelp = req.file?.path
   if(!coverimagelp){
    throw new ApiError(401,"coverimage not find")
   }

   const coverimage =await uploadoncloudinary(coverimagelp)

   if(!coverimage.url){
    throw new ApiError(401,"avtar not upload")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,{
          $set:{coverimage:coverimage.url}
   },{new:true}).select("-password")
   
   res.status(200)
   .json(new Apiresponse (200,user,"coverimage updated succesfully"))

})

const getuserchennelprofile = asynchandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is mising")
    }
    const chennel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                 from:"Subcription",
                 localField:"_id",
                 foreignField:"channel",
                 as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"Subcription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"
            }
        },
        {
             $addFields:{
                subscriberCount:{
                    $size:"$subscribers",    // add filed for the create and show new field
                },
                chennelsubcribcount:{
                    $size:"$subscribeTo"
                },
                issubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
             }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                chennelsubcribcount:1,
                issubscribed:1,
                avtar:1,
                coverimage:1,
                email:1
            }
        }
    ])

    if(!chennel){
        throw new ApiError(404,"chennel dose not exist")
    }
    return res.status(200)
    .json(new Apiresponse(200,chennel[0],"user chennel fatch succesfully"))
})

export { 
    registeruser,
    loginuser,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateaccountdetail,
    updateuseravtar,
    updateusercoverimage,
    getuserchennelprofile
};


