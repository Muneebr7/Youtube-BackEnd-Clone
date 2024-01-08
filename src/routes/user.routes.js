import { Router } from "express";
import {
  changeAvatar,
  changeCover,
  changePass,
  getChannelProfile,
  getCurrectUser,
  getWatchHistory,
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJwt, getCurrectUser);
router.route("/update").patch(verifyJwt, updateAccountDetails);
router.route("/change-password").patch(verifyJwt, changePass);
router.route("/avatar").patch(verifyJwt , upload.single("avatar") , changeAvatar)
router.route("/coverImage").patch(verifyJwt , upload.single("coverImage") , changeCover)
router.route("/channel/:username").get(verifyJwt,getChannelProfile)
router.route("/watch-history").get(verifyJwt , getWatchHistory)

export default router;
