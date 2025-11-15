import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { getsuggest, suggest } from "./controllers/ai-suggest.js";
import { db } from "./db/db.js";
import { router } from "./routes/story.js";
import { sportRouter } from "./routes/sports.js";
import sportDRouter from "./routes/sportD.js";
import { touRouter } from "./routes/tournament.js";

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
app.use("/tour/api", touRouter);

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// export const apiKey = process.env.GEMINI_API_KEY;



// ✅ Correct Class Name


app.post("/api/suggest-sport", suggest);

app.get("/api/suggest-sport", getsuggest);


app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
