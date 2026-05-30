import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';
import { type } from 'os';

const matchSubscribers = new Map();

function subscribe(matchId, socket){
    if(!matchSubscribers.has(matchId)){
        matchSubscribers.set(matchId , new Set());
    }
    matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket){
    const subscribers = matchSubscribers.get(matchId);

    if(!subscribers) return;

    if(subscribers.size === 0){
        matchSubscribers.delete(matchId);
    }

    subscribers.delete(socket);
}


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
 * Attach a WebSocket server to an existing HTTP(S) server and expose a broadcaster for new matches.
 *
 * The WebSocket server is mounted at path `/ws`; each new connection immediately receives a
 * `{ type: 'welcome' }` message and per-socket errors are logged to console. Returned helper(s)
 * can be used to broadcast messages to all currently connected clients.
 *
 * @param {import('http').Server} server - The HTTP(S) server to bind the WebSocketServer to.
 * @returns {{ broadCastMatchCreated: (match: any) => void }} An object containing `broadCastMatchCreated(match)`, which broadcasts a `{ type: 'match created', data: match }` message to all connected WebSocket clients.
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

    function broadCastMatchCreated(match) {

        console.log("Broadcast created", match);
        broadcasttoAll(wss, { type: 'match created', data: match });
    }

    function broadcastCommentary(matchId, comment){
        broadcastToMatch(matchId, { type: 'commentary', data: comment});
    }

    return { broadCastMatchCreated, broadcastCommentary };
}