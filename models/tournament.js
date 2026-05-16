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
    type: Date,
    required : true
  },
  registrationStartDate: {
    type: Date,
    required : true
  },

  location: {
    type: String
  },

  venue: {
    type: String    
  },

  image: {
    type: String  
  },

  entryFee: {
    type: Number   
  },

  prizePool: {
    type: Number  
  },

  rewards: {
    first: { type: String },
    second: { type: String },
    third: { type: String }
  },

  type: {
    type: String    
  },

  skillLevel: {
    type: String    
  },

  gender: {
    type: String  
  },

  ageCategory: {
    type: String   
  },

  sponsor: {
    type: String
  },

  scheduleLink: {
    type: String    
  },

  enrolled: {
    type: Number,
    default: 0
  },

  

  category: {
    type: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true   
  },

  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      paymentId: String,
      orderId: String,
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

  if (now < this.registrationStartDate) {
    return "Upcoming";       
  }

  if (
    now >= this.registrationStartDate &&
    now <= this.registrationDeadline
  ) {
    return "Started";        
  }

  return "Outdated";         
});




tournamentSchema.set("toJSON", { virtuals: true });
tournamentSchema.set("toObject", { virtuals: true });


const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
