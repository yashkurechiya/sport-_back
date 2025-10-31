import mongoose from "mongoose"


export const db = async() =>{
    try{
       await mongoose.connect(process.env.MONGO_URI)

       console.log("DB connected successful");
       
    }
    catch {
        console.error( "error");
        
    }
}