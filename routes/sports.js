import express from 'express'
import Sport from '../models/sport.js';
import redis from '../config/redisClient.js';
 

export const sportRouter = express.Router();

sportRouter.post('/played', (req, res) =>{
    try {
        const {title, image} = req.body; 
        const sport = new Sport({ title, image});
        sport.save();

        res.json({ mesage:"created", sports:sport})
    } catch (error) {
        res.status(500).json({ error:error.message});
    }
})

sportRouter.get('/getsport',async (req,res)=>{
    try {

        const cachedresponse = await redis.get("sport");
        if(cachedresponse){
            console.log("Cache hit");
            
            return res.status(200).json({
                message: "sport get",
                response : JSON.parse(cachedresponse)
            })
        }
        console.log("Cache miss");
        const sport  =await Sport.find();

       await redis.setEx("sport", 1200, JSON.stringify(sport)
        );



        res.json({message:"GOT",  sport})
    } catch (error) {
        res.status(500).json(error.message)
    }
})