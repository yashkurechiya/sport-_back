import express from 'express'
import SportD from '../models/sportDetails.js';
import Sport from '../models/sport.js';

const sportDRouter= express.Router();

sportDRouter.post('/sportD',async (req, res) =>{
    try {
        const sport = new SportD(req.body);
        await sport.save();

        res.status(201).json({ message: "Sport added ", sport})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

sportDRouter.get('/sportget', async(req,res)=>{
    try {
        const sport = await SportD.find();
        res.status(200).json(sport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

sportDRouter.delete('/delete', async (req, res) =>{
    try {
        const { _id }= req.body;
        await SportD.findByIdAndDelete(_id);

        res.status(201).json({
            maessage: "Deleted"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default sportDRouter;