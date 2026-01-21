import express from "express";
import cors from "cors";
import http from 'http'
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { suggest } from "./controllers/ai-suggest.js";
import { db } from "./db/db.js";
import { router } from "./routes/story.js";
import { sportRouter } from "./routes/sports.js";
import sportDRouter from "./routes/sportD.js";
import { touRouter } from "./routes/tournament.js";
import userRouter from "./routes/authRoutes.js";
import usRouter from "./routes/userRoutes.js";
import Prouter from "./routes/payment.js";
import redis from "./config/redisClient.js";
import { initSocket } from "./socket.js";
import chatRoute from "./routes/chatRoute.js";
// import { payRouter } from "./routes/payment.js";

dotenv.config();
db();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://sport-front-sooty.vercel.app",
      "https://www.goindia.online"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use('/admin', router);
app.use("/sport", sportRouter);
app.use("/api", sportDRouter);
app.use("/api/tour", touRouter);
app.use("/api/payment", Prouter)
app.use("/api/auth", userRouter);
app.use("/api/users", usRouter);
app.use("/api/chat", chatRoute);
// app.use("/api/payment", payRouter)

redis.on("connect", () => {
  console.log(" Redis Connected");

})

const io = initSocket(server);

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.set("io", io);

// export const apiKey = process.env.GEMINI_API_KEY;



// ✅ Correct Class Name


app.post("/api/suggest-sport", suggest);

server.listen(5000, () => console.log("connected server 5000 "))

// app.get("/api/suggest-sport", getsuggest);


// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
