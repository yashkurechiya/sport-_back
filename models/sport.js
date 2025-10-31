import mongoose from "mongoose";

const Sporty = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
   
} , {timestamps: true});

const Sport = mongoose.model('Sport', Sporty);
export default Sport;