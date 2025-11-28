import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  date: {
    type: Date,
    required: true
  },

  registrationDeadline: {
    type: Date
  },

  location: {
    type: String
  },

  venue: {
    type: String   // Example: Indoor Stadium Court 3
  },

  image: {
    type: String   // Tournament banner URL
  },

  entryFee: {
    type: Number   // Example: 500
  },

  prizePool: {
    type: Number   // Example: 10000
  },

  rewards: {
    first: { type: String },
    second: { type: String },
    third: { type: String }
  },

  type: {
    type: String   // Singles, Doubles, Knockout, League
  },

  skillLevel: {
    type: String   // Beginner, Intermediate, Professional
  },

  gender: {
    type: String   // Male, Female, Mixed
  },

  ageCategory: {
    type: String   // U-16, U-19, Open
  },

  sponsor: {
    type: String
  },

  scheduleLink: {
    type: String   // PDF / Google Sheet Link
  },

  enrolled: {
    type: Number,
    default: 0
  },

  state: {
    type: String,
    default: "Upcoming"
  },

  category: {
    type: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true   // keep required for admin ownership
  },

  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
