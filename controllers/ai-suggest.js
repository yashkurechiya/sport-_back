import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing");
  process.exit(1);
}

const genAI = new GoogleGenAI(apiKey);

const suggest = async (req, res) => {
  // 🔹 Always log once in production (can remove later)
  console.log("REQ BODY:", req.body);

  // 🔹 Read exactly what frontend sends
  const { height, weight, hobbies, goals } = req.body;

  // 🔹 Safe validation (NO false negatives)
  if (
    height === undefined ||
    weight === undefined ||
    typeof hobbies !== "string" ||
    typeof goals !== "string"
  ) {
    return res.status(400).json({
      message: "Required fields missing or invalid",
      expected: ["height", "weight", "hobbies", "goals"],
      received: req.body,
    });
  }

  // 🔹 SAME PROMPT (cleaned but unchanged meaning)
  const prompt = `
You are an AI sports career advisor.

User details:
- Height: ${height}
- Weight: ${weight}
- Hobbies: ${hobbies}
- Goals: ${goals}

Suggest 2 sports that best suit the user.

Return the response strictly in the following JSON format:

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
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiText = response.text;

    console.log("✅ AI response generated");

    return res.status(200).json({
      success: true,
      data: aiText,
    });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate sports suggestion",
      error: error.message,
    });
  }
};

 

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