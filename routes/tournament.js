import express, { Router } from 'express'
import Tournament from '../models/tournament.js';

export const touRouter = express.Router();

touRouter.post('/create', async (req, res) => {
    try {
        const tournament = new Tournament(req.body)
        await tournament.save();

        res.status(201).json({
            success: true,
            message: "Tournament created successfully",
            data: tournament
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

touRouter.get('/getTournament', async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ date: 1});
        const today = new Date();

        const enhanced = tournaments.map(t => {
            const tDate = new Date(t.date);

            let status = "";
            if(tDate > today) status = "upcoming";
            else if (tDate.toDateString() === today.toDateString()) status = "started";
            else status = "outdated";

            return {
                ...t._doc,
                status
            };
        });
        res.json({ success: true, data: enhanced });
    } catch (error) {
        res.status(500).json({ succcess: false, message: error.message });
    }
})