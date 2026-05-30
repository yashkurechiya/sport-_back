import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db1 } from "../db/db1.js";
import { commentaryTable } from "../db/schema.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";

export const commentaryRouter = Router(
    {
        mergeParams: true
    }
);

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        return res.status(400).json({ error: 'Invalid params', details: JSON.stringify(parsedParams.error.issues) });
    }

    const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
        return res.status(400).json({ error: 'Invalid query', details: JSON.stringify(parsedQuery.error.issues) });
    }

    const limit = Math.min(parsedQuery.data.limit ?? MAX_LIMIT, MAX_LIMIT);

    try {
        const commentary = await db1
            .select()
            .from(commentaryTable)
            .where(eq(commentaryTable.matchId, parsedParams.data.id))
            .orderBy(desc(commentaryTable.createdAt))
            .limit(limit);

        return res.status(200).json({ data: commentary });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch commentary', details: JSON.stringify(error) });
    }
});

commentaryRouter.post('/', async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        return res.status(400).json({ error: 'Invalid params', details: JSON.stringify(parsedParams.error.issues) });
    }

    const parsedBody = createCommentarySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: 'Invalid payload', details: JSON.stringify(parsedBody.error.issues) });
    }

    try {
        const { minute, ...rest } = parsedBody.data;
        const [result] = await db1
            .insert(commentaryTable)
            .values({
                matchId: parsedParams.data.id,
                minute,
                ...rest
            })
            .returning();

        if(res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(result.matchId, result);
        }

        return res.status(201).json({
            data: result
        });

        return res.status(201).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create commentary', details: JSON.stringify(error) });
    }
});