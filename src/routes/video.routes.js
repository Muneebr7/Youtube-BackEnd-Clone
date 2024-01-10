import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateVideo,
  togglePublishStatus
} from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter
  .route("/")
  .get(getAllVideos)
  .post(
    verifyJwt,
    upload.fields([
      {
        name: "video",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .patch(verifyJwt, upload.single("thumbnail"), updateVideo)
  .delete(verifyJwt, deleteVideo);

  videoRouter.route("/toggle/publish/:videoId").patch(verifyJwt,togglePublishStatus);

export default videoRouter;
