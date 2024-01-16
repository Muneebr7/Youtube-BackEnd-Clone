import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import { verifyJwt } from '../middleware/auth.middleware.js'

const commentRouter = Router();

commentRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

commentRouter.route("/:videoId").get(getVideoComments).post(addComment);
commentRouter.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default commentRouter