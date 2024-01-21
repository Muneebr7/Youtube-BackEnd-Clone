import { ApiError } from "./ApiError.js";

const asyncHandler = (fn) => async (req,res,next) => {
    try {
       return await fn(req,res,next)
    } catch(error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
              success: false,
              message: error.message,
            });
          } else {
            console.error(error);
            res.status(500).json({
              success: false,
              message: "Internal Server Error",
            });
          }
    }
}


export  {asyncHandler};