import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {   suggest } from "./controllers/ai-suggest.js";
import { db } from "./db/db.js";
import { router } from "./routes/story.js";
import { sportRouter } from "./routes/sports.js";
import sportDRouter from "./routes/sportD.js";
import { touRouter } from "./routes/tournament.js";
import userRouter from "./routes/authRoutes.js";
import usRouter from "./routes/userRoutes.js";
import Prouter from "./routes/payment.js";
// import { payRouter } from "./routes/payment.js";

dotenv.config();
db();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/admin', router);
app.use("/sport", sportRouter);
app.use("/api", sportDRouter);
app.use("/api/tour", touRouter);
app.use("/api/payment", Prouter)
app.use("/api/auth", userRouter);
app.use("/api/users", usRouter);
// app.use("/api/payment", payRouter)


console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log(
  "RAZORPAY_SECRET_KEY:",
  process.env.RAZORPAY_SECRET_KEY ? "LOADED" : "MISSING"
);


app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// export const apiKey = process.env.GEMINI_API_KEY;



// ✅ Correct Class Name


app.post("/api/suggest-sport", suggest);

// app.get("/api/suggest-sport", getsuggest);


app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
