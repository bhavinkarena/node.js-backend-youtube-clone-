import { Router } from "express";
import { changecurrentpassword,
         getcurrentuser,
         getuserchennelprofile,
         loginuser,
         logoutuser,
         refreshaccesstoken,
         registeruser,
         updateaccountdetail,
         updateuseravtar,
         updateusercoverimage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyjwt } from "../middlewares/auth.js";

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },{
            name:"coverimage",
            maxCount:1
        }
    ]),registeruser
    )

router.route("/login").post(loginuser)

router.route("/logout").post(verifyjwt,logoutuser)

router.route("/refreshtoken").post(refreshaccesstoken)

router.route("/changepassword").post(verifyjwt,changecurrentpassword)

router.route("/currentuser").get(verifyjwt,getcurrentuser)

router.route("/update-details").patch(verifyjwt,updateaccountdetail)

router.route("/avtar").patch(verifyjwt,upload.single("avtar"),updateuseravtar)
router.route("/coverimage").patch(verifyjwt,upload.single("coverimage"),updateusercoverimage)
router.route("/c/:username").get(verifyjwt,getuserchennelprofile)


export default router;