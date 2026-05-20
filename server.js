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
import rateLimit from 'express-rate-limit'
import { RedisStore } from "connect-redis";
import { generateToken } from "./utils/generatetoken.js";
import { matchRoute } from "./routes/matches.js";
import { attachWebSocket } from "./ws/index.js";

dotenv.config();
db(); 

const app = express();
const PORT =Number( process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
const server = http.createServer(app);

 

const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  "http://localhost:3001", 
  "http://127.0.0.1:3000",
  "https://sport-front-sooty.vercel.app",
  "https://www.goindia.online"
].filter(Boolean));

const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max : 100,
  message: 'Too many applications',
  headers: true
});

app.use(limiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
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
app.use('/matches', matchRoute);

redis.on("connect", () => {
  console.log(" Redis Connected");

})
 
 
// app.get('/', (req, res) => {
//     res.send('<a href="/auth/google">Login with Google</a>');
// });

 

app.get('/logout', (req, res)=>{
    req.logout(() => {

    res.clearCookie("token");

    req.session.destroy(() => {

      res.redirect(process.env.FRONTEND_URL);

    });

  });

})

const io = initSocket(server);
const { broadCastMatchCreated } = attachWebSocket(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.set("io", io);

 

app.post("/api/suggest-sport", suggest);

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`${PORT} working on ${baseUrl}`);
  console.log(`WebSocket running on ${baseUrl.replace("http", "ws")}/ws`);
});
  

 
