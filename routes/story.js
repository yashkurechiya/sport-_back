import express from 'express'
import Story from '../models/story.js';

export const router = express.Router();

router.post('/v1/story',async (req, res) =>{

    try {
        const {name, sport ,description, link, img} =  req.body;
    
        const storyCard = new Story({name, description,img , link, sport});
        await storyCard.save();

        res.status(201).json({ message:" Story Created", store : storyCard});
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }

});

router.get('/v1/getstory', async (req, res) =>{
    try {
        const story = await Story.find();
        res.json(story);
    } catch (error) {
        res.status(500).json({message: 'Server error' + error.message});
    }
})

router.get('/v1/getstoryIndi', async (req, res) =>{
    try {
        const story = await Story.findById( req.body.id );
        res.json(story);
    } catch (error) {
        res.status(500).json({message: 'Server error' + error.message});
    }
})