import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const tweetRouter =  Router();

tweetRouter.use(verifyJwt)

tweetRouter.route('/').post(createTweet)
tweetRouter.route('/user/:userId').get(getUserTweets)
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);


export default tweetRouter