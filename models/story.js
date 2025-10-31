import mongoose from "mongoose";

const Stor = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
  img: {
    type: String,
    required: true,
  },
}, { timestamps: true });

 
const Story = mongoose.model("Story", Stor);

export default Story;
