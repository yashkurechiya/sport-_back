import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';
import { type } from 'os';

const matchSubscribers = new Map();

/**
 * Add the given WebSocket to the subscriber set for the specified match.
 *
 * Ensures a subscriber set exists for the match and registers the socket as a subscriber.
 *
 * @param {number|string} matchId - Identifier of the match to subscribe to.
 * @param {WebSocket} socket - The client WebSocket to add to the match's subscribers.
 */
function subscribe(matchId, socket){
    if(!matchSubscribers.has(matchId)){
        matchSubscribers.set(matchId , new Set());
    }
    matchSubscribers.get(matchId).add(socket);
}

/**
 * Remove a WebSocket from the subscriber set for a given match and clean up the match entry if empty.
 * @param {number} matchId - The match identifier whose subscriber set will be updated.
 * @param {WebSocket} socket - The client socket to remove from the match's subscribers.
 */
function unsubscribe(matchId, socket){
    const subscribers = matchSubscribers.get(matchId);

    if(!subscribers) return;

    if(subscribers.size === 0){
        matchSubscribers.delete(matchId);
    }

    subscribers.delete(socket);
}


/**
 * Remove the given socket from every match subscription it currently holds.
 * @param {WebSocket & { subscriptions: Set<number|string> }} socket - Socket object containing a `subscriptions` Set of match IDs; each listed subscription will be removed for that socket.
 */
function cleanUpSubscription(socket){
    for(const matchId of socket.subscriptions) {
        unsubscribe(matchId, socket);
    }
}

/**
 * Send an object as a JSON string over a WebSocket if the socket is open.
 * @param {WebSocket} socket - The WebSocket to send the payload on.
 * @param {*} payload - The value to serialize and send.
 */
function sendJson(socket, payload) {
    if (socket.readyState != WebSocket.OPEN) {
        return;
    }

    socket.send(JSON.stringify(payload));
}

/**
 * Broadcasts a payload to every connected client that is currently open.
 *
 * The payload is serialized with `JSON.stringify` and sent only to clients whose
 * `readyState` is `WebSocket.OPEN`.
 *
 * @param {import('ws').WebSocketServer} wss - The WebSocket server whose clients will receive the message.
 * @param {*} payload - The value to serialize and send to each open client.
 */
function broadcasttoAll(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
            continue;
        }
        client.send(JSON.stringify(payload));
    }
}


/**
 * Broadcasts a JSON-serializable payload to all open WebSocket clients subscribed to the given match.
 *
 * Only subscribers whose socket `readyState` equals `WebSocket.OPEN` will receive the message.
 *
 * @param {number|string} matchId - Identifier of the match whose subscribers should receive the payload.
 * @param {*} payload - Value to JSON.stringify and send to each subscriber; must be JSON-serializable.
 */
function broadcastToMatch(matchId, payload){
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers || subscribers.size ===0) return;
    
    const message = JSON.stringify(payload);

    for(const client of subscribers){
        if(client.readyState === WebSocket.OPEN){
            client.send(message);
        }
    }
}

/**
 * Parse an incoming WebSocket message and handle `subscribe`/`unsubscribe` commands, updating subscription state and sending acknowledgements or an error.
 *
 * Parses `data` as JSON; if parsing fails, sends `{ type: 'error', message: 'Invalid JSON' }`.
 * If the parsed message has `type: 'subscribe'` and an integer `matchId`, subscribes the socket to that match, adds `matchId` to `socket.subscriptions`, and sends `{ type: 'subscribed', matchId }`.
 * If the parsed message has `type: 'unsubscribe'` and an integer `matchId`, unsubscribes the socket from that match, removes `matchId` from `socket.subscriptions`, and sends `{ type: 'unsubscribed', matchId }`.
 *
 * @param {WebSocket} socket - The client socket; expected to have a `subscriptions` Set for tracking subscribed match IDs.
 * @param {Buffer|string} data - Raw message payload received from the socket.
 */
function handleMessage(socket, data){
    let message;
    try {
        message = JSON.parse(data.toString());
    } catch (error) {
        sendJson(socket, {type :'error', message:'Invalid JSON'})
    }

    if(message?.type === 'subscribe' && Number.isInteger(message.matchId)){
        subscribe(message.matchId, socket);
        socket.subscriptions.add(message.matchId);
        sendJson(socket , {type: 'subscribed', matchId : message.matchId});
    }

    if(message?.type === 'unsubscribe' && Number.isInteger(message.matchId)){
        unsubscribe(message.matchId, socket);
        socket.subscriptions.delete(message.matchId);
         sendJson(socket , {type: 'unsubscribed', matchId : message.matchId});
    }
}

/**
 * Create and attach a WebSocket server at /ws that manages client subscriptions and provides broadcasters for match events.
 *
 * The server sends an immediate `{ type: 'welcome' }` to new connections, maintains per-connection match subscription state, and enforces connection protection when configured. Returned helpers allow broadcasting a "match created" event to all connected clients and sending commentary only to subscribers of a specific match.
 *
 * @param {import('http').Server} server - The HTTP(S) server to bind the WebSocket server to.
 * @returns {{ broadCastMatchCreated: (match: any) => void, broadcastCommentary: (matchId: number, comment: any) => void }} An object with:
 *  - `broadCastMatchCreated(match)`: broadcasts `{ type: 'match created', data: match }` to all connected WebSocket clients.
 *  - `broadcastCommentary(matchId, comment)`: broadcasts `{ type: 'commentary', data: comment }` only to clients subscribed to `matchId`.
 */
export function attachWebSocket(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    });

    wss.on('connection', async (socket, req) => {
        if(wsArcjet){
            try {
                const decision = await wsArcjet.protect(req);

                if(decision.isDenied()){
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate Limit exceeded': 'Access Denied';

                    socket.close(code, reason);
                    return;
                }
                
            } catch (error) {
                console.error(' WS connection error', error);
                socket.close(1011, 'Server security error');
                return;
                
            }
        }
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJson(socket, { type: 'welcome' });

        socket.on('message', (data)=>{
            handleMessage(socket, data);
        });

        socket.on('error',  ()=>{
            socket.terminate();
        });
        
        socket.on('close',  ()=>{
            cleanUpSubscription(socket);
        });

    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive == false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        })
    }, 30000)

    wss.on('close', () => clearInterval(interval));

    /**
     * Notify all connected WebSocket clients that a new match was created.
     * Sends a `{ type: 'match created', data: match }` payload to every open client.
     * @param {Object} match - The created match object to include in the broadcast payload.
     */
    function broadCastMatchCreated(match) {

        console.log("Broadcast created", match);
        broadcasttoAll(wss, { type: 'match created', data: match });
    }

    /**
     * Send a commentary payload to all currently subscribed clients for a match.
     * @param {number} matchId - The numeric identifier of the match whose subscribers should receive the commentary.
     * @param {*} comment - The commentary content to include as the `data` field of the payload.
     */
    function broadcastCommentary(matchId, comment){
        broadcastToMatch(matchId, { type: 'commentary', data: comment});
    }

    return { broadCastMatchCreated, broadcastCommentary };
}