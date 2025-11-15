import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    description: String,
    date:
    {
        type: Date,
        required: true
    },
    location: String,
    enrolled:
    {
        type: Number,
        default: 0
    },
    state : {
        type: String
    },
    category: String, // Example: Locals, State, National
    createdAt:
    {
        type: Date,
        default: Date.now
    }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;