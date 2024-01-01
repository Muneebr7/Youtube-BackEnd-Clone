import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
        username :  {
            type :  String,
            required : true,
            unique : true,
            lowercase : true,
            trim: true,
            index : true
        },

        email : {
            type : String,
            required : true,
            lowercase : true,
            trim : true,
        },
        fullName : {
            type : String,
            index  : true,
            required : true,   
        },
        avatar : {
            type : String , // cloudinary URl,
            required: true
        },
        coverImage : {
            type: String
        },
        watchHistory : [
            {
                type: Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password :{
            type : String,
            required : [true, "Password is required"],
        },
        refreshToken : {
            type : String 
        }
} , {timestamps : true})


userSchema.pre("save" , async function(next){   
    if(!this.isModified("password")) return next()
    this.password = bcrypt(this.password , 10)
    next()
})

userSchema.method.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = function (){
  return jwt.sign({
        _id : this._id,
        email : this.email,
        username: this.username,
        fullName : this.fullName
    },  
        process.env.ACCESS_TOKEN_SECRET,
    {
            expiresIn :  process.env.ACCESS_TOKEN_EXPIRTY
    })
}


export const user = mongoose.userSchema("User" , userSchema)