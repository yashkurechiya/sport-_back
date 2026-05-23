import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

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
function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
            continue;
        }
        client.send(JSON.stringify(payload));
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

    wss.on('connection', async (socket, request) => {
        if(wsArcjet){
            try {
                const decision = await wsArcjet.protect(request);
                if (decision.isErrored()) {
                    console.error('WS Arcjet decision errored', decision.reason);
                    socket.close(1011, 'Server security error');
                    return;
                }

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
        sendJson(socket, { type: 'welcome' });
        socket.on('error', console.error);
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
        broadcast(wss, { type: 'match created', data: match });
    }

    return { broadCastMatchCreated }
}