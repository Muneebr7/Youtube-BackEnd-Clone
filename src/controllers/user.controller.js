import {asyncHandler} from '../utils/asyncHandler.js'

const regiserUser = asyncHandler( async (req,res)=>{
    res.status(200).send({
        message: "success",
    })
})


export {
    regiserUser,
}