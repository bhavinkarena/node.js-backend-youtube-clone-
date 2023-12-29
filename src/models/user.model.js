import mongoose,{Schema} from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        match:['^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',"please enater valid email"]
    },
    fullname:{
        type:String,
        require:true,
        trim:true,
    },
    avtar:{
        type:String,
        require:true,
    },
    coverimage:{
        type:String,
    },
    watchhistry:{
        type:Schema.Types.ObjectId,
        ref:"video"
    },
    password:{
        type:String,
        require:[true,"password in require"],
    },
    refreshtoken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save", async function (next){
    if( ! this.isModified("password"))  return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.genrateaccesstoken = function(){
    return Jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname  
    },  
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.genraterefreshtoken = function(){
    return Jwt.sign({
        _id:this._id,
        
    },  
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",userSchema)