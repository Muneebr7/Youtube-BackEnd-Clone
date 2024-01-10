import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route("/upload").post(verifyJwt, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name : "thumbnail",
        maxCount : 1
    },
]), publishAVideo);

videoRouter.route("/id/:videoId").get(getVideoById)
videoRouter.route('/update/:videoId').patch(verifyJwt, upload.single("thumbnail"), updateVideo)


export default videoRouter;
