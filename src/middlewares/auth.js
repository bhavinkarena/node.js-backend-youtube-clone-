import { ApiError } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import Jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyjwt = asynchandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer","")
 
    if(!token){
       throw new ApiError(401,"unauthorize request")
    }
 
    const decodedtoken = Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
    const user = await User.findById(decodedtoken?._id).select("-password -refreshtoken")
 
    if(!user){
     throw new ApiError(401,"invalid access token")
    }
 
    req.user = user
    next()
   } catch (error) {
      throw new ApiError(401,error?.message,"invalid")
   }
})