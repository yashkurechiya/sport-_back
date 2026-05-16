import Conversation from "../model/conversation.js";

export const adminInbox = async (req, res) => {
  const chats = await Conversation.find()
    .populate("tournamentId", "title")
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: chats });
};
