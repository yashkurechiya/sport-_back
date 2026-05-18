import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import {db1} from '../db/db1.js';
import { startsWith } from "zod";
import { getMatchStatus } from "../utils/match-status.js";
import { matchesTable } from "../db/schema.js";
import { desc } from "drizzle-orm";

export const matchRoute = Router();
const MAX_LIMIT = 100;

matchRoute.get('/match', (req, res)=>{
    res.status(200).json({message: "Match List"});
})


matchRoute.get('/',async (req, res)=>{
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    console.log(parsed);
    
    if(!parsed.success){
        return res.status(400).json({ error : 'Invalid payload', details: JSON.stringify(parsed.error)});
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
    try {
        const data = await db1.select().from(matchesTable).orderBy(desc(matchesTable.createdAt))
                            .limit(limit);
            res.status(200).json({data});
 
            
        
    } catch (error) {
        res.status(500).json({ error:'Failed to fetch matches'});
    }
})

matchRoute.post('/', async (req, res)=>{
    const parsed = createMatchSchema.safeParse(req.body);
    // console.log(parsed);
    
    const { data: {startTime, endTime, homeScore, awayScore}} = parsed;

    if(!parsed.success){
        return res.status(400).json({ error:'Invalid payload', details : JSON.stringify(parsed.error)});
    }
    try {
        const [event] = await db1.insert(matchesTable).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(startTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),
        }).returning();

        res.status(201).json({ data: event });

    } catch (error) {
        return res.status(500).json({ error:'Failed to create', details : JSON.stringify(error)});
        
    }
})
