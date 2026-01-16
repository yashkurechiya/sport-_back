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

  // computedState: {
  //   type: String,
  // },

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
      paymentId : String,
      orderId : String,
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
tournamentSchema.virtual("computedState").get(function () {
  const now = new Date();

  // If no registration deadline
  if (!this.registrationDeadline) {
    return now < this.date ? "Upcoming" : "Outdated";
  }

  // Before tournament starts
  if (now < this.date) {
    return "Upcoming";
  }

  // Tournament started and registration still open
  if (now >= this.date && now <= this.registrationDeadline) {
    return "Started";
  }

  // Registration deadline passed
  return "Outdated";
});



tournamentSchema.set("toJSON", { virtuals: true });
tournamentSchema.set("toObject", { virtuals: true });


const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
