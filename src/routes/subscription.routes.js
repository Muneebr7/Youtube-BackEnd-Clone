import { Router } from "express";
import  {verifyJwt} from '../middleware/auth.middleware.js'
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";


const subscriptionRouter =  Router();

subscriptionRouter.use(verifyJwt)


subscriptionRouter.route('/channel/:channelId').get(getSubscribedChannels).post(toggleSubscription)
subscriptionRouter.route('/u/:subscriberId').get(getUserChannelSubscribers)


export default subscriptionRouter