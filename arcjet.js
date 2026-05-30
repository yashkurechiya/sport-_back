import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARJET_KEY;
const arcjetMode =  process.env.ARJECT_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arcjetMode, interval: '10s', max: 50 })
        ],
    }) : null;

export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arcjetMode, interval: '2s', max: 5 })
        ],
    }) : null;

/**
 * Create an Express middleware that enforces Arcjet protections on incoming requests.
 *
 * The returned middleware calls `next()` immediately when Arcjet is not configured.
 * When Arcjet is configured, the middleware applies protection and:
 * - responds with 429 and `{ error: 'Too many request. ' }` if denied for rate limiting,
 * - responds with 403 and `{ error: 'Forbidden.' }` for other denials,
 * - responds with 503 and `{ error: 'Service Unavailable' }` if an error occurs while protecting.
 *
 * @returns {Function} An Express-style middleware function `(req, res, next)`.
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
            console.error('Arject middleware error', error);
            return res.status(503).json({ error: 'Service Unavailable'});
            
        }
        next();
    }
}