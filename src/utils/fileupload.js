import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadoncloudinary = async (localfilepath) =>{
    try {
        if(!localfilepath) return null;
        //for upload
       const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //file upload
        // console.log("file is upload",response.url)
        fs.unlinkSync(localfilepath)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove file
        return null
    }
} 

export {uploadoncloudinary}

// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });