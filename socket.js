// socket.js
import { Server } from "socket.io";

/**
 * Initializes and configures a Socket.IO server instance with CORS validation and
 * tournament-based room messaging.
 *
 * Works as follows:
 * - Builds an allowlist of frontend origins (from environment + known domains + localhost variants).
 * - Applies a custom CORS origin check:
 *   - Allows requests with no origin (e.g., some non-browser clients),
 *   - Allows exact matches in the allowlist,
 *   - Allows localhost/127.0.0.1 on any port.
 * - Registers socket event handlers:
 *   - `joinTournament(id)`: joins the client to room `tournament_<id>`.
 *   - `sendMessage(data)`: broadcasts `receiveMessage` to the corresponding tournament room
 *     using `data.tournamentId`.
 *   - `disconnect`: handles client disconnection (no-op hook).
 * - Returns the configured `io` instance for reuse elsewhere in the app.
 *
 * @param {import("http").Server | import("https").Server} server - Node HTTP/HTTPS server to bind Socket.IO to.
 * @returns {import("socket.io").Server} Configured Socket.IO server instance.
 */
export const initSocket = (server) => {
  const allowedOrigins = new Set([
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sport-front-sooty.vercel.app",
    "https://www.goindia.online"
  ].filter(Boolean));

  const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });


  io.on("connection", (socket) => {
    socket.on("joinTournament", (id) => {
      socket.join(`tournament_${id}`);
    });

    socket.on("sendMessage", (data) => {
      io.to(`tournament_${data.tournamentId}`).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => { });
  });

  return io;
};
