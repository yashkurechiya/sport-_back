
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
// import { apiKey } from "../server.js";

const apiKey =  process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is not set in the .env file.");
  process.exit(1);
}
const genAI = new GoogleGenAI(apiKey);

const suggest = async (req, res) => {
  const user = req.body;

  
  

  const prompt = `
You are an AI sports career advisor.

User details:
 
- Height: ${user.height}
- Weight: ${user.weight}
- Hobbies: ${user.hobbies}
 
- Goals: ${user.goals}

Suggest 2 sports for the user. 
Return the response in the following JSON format:

{
  "sports": [
    {
      "name": "",
      "why": ["", "", ""],
      "roadmap": ["", "", ""],
      "tips": ["", "", ""],
      "motivation": ""
    }
  ]
}

  Total words must be less than 250.
`;

  try {
    // ✅ Use correct model name
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: prompt,
      },
    });
    
    const aiText = response.text;

    console.log("✅ AI Response Generated Successfully");
    console.log(aiText);

    res.json(aiText);
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({
      message: "Error generating suggestion. Please check server logs.",
      error: error.message,
    });
  }
}

const getsuggest = async (req, res) => {
  const user = req.query;

  if (!user || !user.height) {
    return res.status(400).json({ message: "User data is missing or incomplete." });
  }
 


  const prompt = `
You are an AI sports career advisor.

User details:
 
- Height: ${user.height}
- Weight: ${user.weight}
- Hobbies: ${user.hobbies}
- Goals: ${user.goals}

 Based on this, suggest 2 sports that best suit them.
  For each sport, include:
  1. Why it suits them.
  2. A beginner roadmap (3-step plan).
  3. Training tips & resources.
  4. A short motivation line.
Return the response in the following JSON format:

{
  "sports": [
    {
      "name": "",
      "why": ["", "", ""],
      "roadmap": ["", "", ""],
      "tips": ["", "", ""],
      "motivation": ""
    }
  ]
}

Total words must be less than 250.
`;

  try {
    // ✅ Use correct model name
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: prompt,
      },
    });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const result = await model.generateContent(prompt);
    // const aiText = result.response.text();
    const aiText = response.text;

    console.log("✅ AI Response Generated Successfully");
   

    res.json( aiText);

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({
      message: "Error generating suggestion. Please check server logs.",
      error: error.message,
    });
  }
}

export {suggest, getsuggest};