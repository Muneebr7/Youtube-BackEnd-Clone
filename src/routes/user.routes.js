import { Router } from "express";
import {
  changePass,
  getCurrectUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logOutUser);
router.route('/refresh-token').post(refreshAccessToken)
router.route('/current-user').get(verifyJwt,getCurrectUser)
router.route('/update' , verifyJwt,updateAccountDetails)
router.route('/change-password' , verifyJwt,changePass)


export default router;
