import express from 'express'
import Sport from '../models/sport.js';

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
        const sport  =await Sport.find();

        res.json({message:"GOT",  sport})
    } catch (error) {
        res.status(500).json(error.message)
    }
})