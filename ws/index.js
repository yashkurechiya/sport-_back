import { WebSocket, WebSocketServer } from 'ws';

function sendJson(socket, payload) {
    if (socket.readyState != WebSocket.OPEN) {
        return;
    }

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
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

    ws.on('connection', (socket) => {
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

    ws.on('close', () => clearInterval(interval));

    function broadCastMatchCreated(match) {

        console.log("Broadcast created", match);
        broadcast(wss, { type: 'match created', data: match });
    }

    return { broadCastMatchCreated }
}