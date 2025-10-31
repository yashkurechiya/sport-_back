import mongoose from "mongoose";

const sportTimeline = new mongoose.Schema({
    year: String,
    player: String,
    achivement: String,
    story: String,
    img: String,    
});

const pathDataSchema = new mongoose.Schema({
    title: String,
    subtitle:String,
    contact: String,
    color: String,
});

const scholarShip = new mongoose.Schema({
    title: String,
    details: String,
});

const gsaptimeline = new mongoose.Schema({
    year: String,
    player: String,
    achievement: String,
    story:String,
    img:String
});

const sportSchema = new mongoose.Schema({
    id : {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required:true,
    },
    medals: {
        type: Number, 
        default:0
    },
    description: {
        type:String
    },
    image : {
        type: String
    },
    videoId : {
        type: String
    },
    rules : [ String ],
    eligibility : [ String ],
    pathData : [pathDataSchema],
    scholarships : [scholarShip],
    gsaptime : [gsaptimeline],
    sporttime : [sportTimeline],
});

const SportD = mongoose.model("SportD", sportSchema);

export default SportD;