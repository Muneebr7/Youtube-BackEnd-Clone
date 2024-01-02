import {asyncHandler} from '../utils/asyncHandler.js'

const regiserUser = asyncHandler( async (req,res)=>{

    const {fullName , email, username , password} =  req.body
    console.log("email :" , email)
})


export {
    regiserUser,
}