import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARJET_KEY;
const arjectMode = process.env.ARJET_ENV === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arjectMode }),
            detectBot({ mode: arjectMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arjectMode, interval: '10s', max: 50 })
        ],
    }) : null;

export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arjectMode }),
            detectBot({ mode: arjectMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
            slidingWindow({ mode: arjectMode, interval: '2s', max: 5 })
        ],
    }) : null;

export function securityMiddleware() {
    return async(req, res, next) => {
        if(!httpArcjet) return next();

        try {
            const decision = await httpArcjet.protect(req);
            if (decision.isErrored()) {
                console.error('Arcjet decision errored, allowing request', decision.reason);
            } else if(decision.isDenied()){
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