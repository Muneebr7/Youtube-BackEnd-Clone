import { Router } from "express";
import {upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";


const videoRouter = Router()


videoRouter.route('/upload').post(verifyJwt, upload.single("video"), publishAVideo)


export default videoRouter