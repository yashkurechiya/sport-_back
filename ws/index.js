import { WebSocket, WebSocketServer } from 'ws';

function sendJson(socket, payload) {
    if (socket.readyState != WebSocket.OPEN) {
        return;
    }

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState != WebSocket.OPEN) {
            continue;
        }
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocket(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    });

    wss.on('connection', (socket) => {
        sendJson(socket, { type: 'welcome' });
        socket.on('error', (err) => console.error('WebSocket error:', err));
    });

    function broadCastMatchCreated(match) {

        console.log("Broadcast created", match);
        
        broadcast(wss, { type: 'match created', data: match });
    }

    return { broadCastMatchCreated }
}