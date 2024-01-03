import {asyncHandler} from '../utils/asyncHandler.js'

const regiserUser = asyncHandler( async (req,res)=>{

    const {fullName , email, username , password} =  req.body
   
})


export {
    regiserUser,
}