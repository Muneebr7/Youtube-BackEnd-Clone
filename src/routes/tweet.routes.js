import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";

const tweetRouter =  Router();

tweetRouter.use(verifyJwt)

tweetRouter.route('/').post(createTweet)


export default tweetRouter