import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        unique: true,
        required : true,
    },
    email : {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    googleId : {
        type: String,
        unique: true,
        sparse: true,
    },
    provider : {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    password : {
        type: String,
        required : false,
    },
    role : {
        type : String,
        required : true,
        enum: ["admin", "user","me"],
        default: "user",
    }
}, {
    timestamps : true
})

const User = mongoose.model("User", userSchema)

export default User;