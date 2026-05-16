// controllers/chatController.js
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import redis from "../config/redisClient.js";
import { isAdminOfTournament, isUserEnrolled } from "../utils/chat.js";

export const sendMessage = async (req, res) => {
  const { tournamentId } = req.params;
  const { message } = req.body;
  const { id, role } = req.user;

  if (role === "admin") {
    const isAdmin = await isAdminOfTournament(id, tournamentId);
    if (!isAdmin) {
      return res.status(403).json({  message: "Not allowed" });
    }
  }

  if (role === "user") {
    const enrolled = await isUserEnrolled(id, tournamentId);

    if (enrolled == false) {
      return res.status(403).json({ success:false, message: "Not enrolled" });
    }
  }

  const msg = await Message.create({
    tournamentId,
    senderId: id,
    senderRole: role,
    message,
  });

  await Conversation.findOneAndUpdate(
    { tournamentId },
    { lastMessage: message, $addToSet: { participants: id } },
    { upsert: true }
  );

  await redis.incr(`unread:${tournamentId}`);

  return res.status(201).json({ success: true, data: msg });
};


export const getMessages = async (req, res) => {
  const { tournamentId } = req.params;
  const messages = await Message.find({ tournamentId }).sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
};
