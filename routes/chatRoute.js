import express from 'express'
import verifyToken from '../middlewares/authMiddlewares.js';
import { getMessages, sendMessage } from '../controllers/chat.js';

const chatRoute = express.Router();

chatRoute.post("/tournament/:tournamentId/send", verifyToken, sendMessage);
chatRoute.get("/tournament/:tournamentId", verifyToken, getMessages);

export default chatRoute;