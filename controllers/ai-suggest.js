import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(" ERROR: GEMINI_API_KEY is missing");
  process.exit(1);
}

const genAI = new GoogleGenAI(apiKey);

const suggest = async (req, res) => {
  console.log("REQ BODY:", req.body);

  const { height, weight, hobbies, goals } = req.body;

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

    console.log(" AI response generated");

    return res.status(200).json({
      success: true,
      data: aiText,
    });
  } catch (error) {
    console.error(" Gemini API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate sports suggestion",
      error: error.message,
    });
  }
};

 

 

export {suggest};