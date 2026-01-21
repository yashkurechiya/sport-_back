// socket.js
import { Server } from "socket.io";

export const initSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://sport-front-sooty.vercel.app",
        "https://www.goindia.online"
      ],
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
