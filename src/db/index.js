import mongoose from "mongoose";
import {DB_NAME} from '../constatns.js'


const connetDb = async() =>{

    try{

    const dbConnection =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log(`Mongo Db is connected ${dbConnection.connection.host}`)
    

    }catch(error){
            console.log( 'mongodb error ' , error)
            process.exit(1)
        }

}


export default connetDb;