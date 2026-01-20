import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      unique: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
