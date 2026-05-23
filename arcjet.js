import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARJET_KEY;
const arjectMode = process.env.ARJET_ENV === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if (!arcjetKey) throw new Error('Arject_Key environment variable is missing.');

export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ node: arjectMode }),
            detectBot({ node: arjectMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arjectMode, interval: '10s', max: 50 })
        ],
    }) : null;

export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ node: arjectMode }),
            detectBot({ node: arjectMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arjectMode, interval: '2s', max: 5 })
        ],
    }) : null;

/**
 * Create an Express middleware that enforces Arcjet protection on incoming HTTP requests.
 *
 * When Arcjet is not configured the middleware calls `next()` immediately. When configured it evaluates protection for the request and:
 * - responds with HTTP 429 and `{ error: 'Too many request. ' }` if the decision is a rate-limit denial,
 * - responds with HTTP 403 and `{ error: 'Forbidden.' }` for other denials,
 * - responds with HTTP 503 and `{ error: 'Service Unavailable' }` if an internal error occurs.
 *
 * @returns {import('express').RequestHandler} An Express-style middleware function.
 */
export function securityMiddleware() {
    return async(req, res, next) => {
        if(!httpArcjet) return next();

        try {
            const decision = await httpArcjet.protect(req);
            if(decision.isDenied()){
                if(decision.reason.isRateLimit()){
                    return res.status(429).json({ error: 'Too many request. '});
                }
                return res.status(403).json({ error: 'Forbidden.'});
            }
        } catch (error) {
            console.error('Arject middleware error', e);
            return res.status(503).json({ error: 'Service Unavailable'});
            
        }
        next();
    }
}