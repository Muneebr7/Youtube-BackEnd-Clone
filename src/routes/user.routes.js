import { Router } from "express";
import {
  logOutUser,
  loginUser,
  registerUser,
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

Router.route("/login").post(loginUser);
Router.route("/logout").post(verifyJwt(), logOutUser);

export default router;
