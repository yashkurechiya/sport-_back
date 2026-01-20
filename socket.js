// socket.js
import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: "http://localhot:3000" } });

  io.on("connection", (socket) => {
    socket.on("joinTournament", (id) => {
      socket.join(`tournament_${id}`);
    });

    socket.on("sendMessage", (data) => {
      io.to(`tournament_${data.tournamentId}`).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};
