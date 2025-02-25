// Import the OpenAI service
import { createMessages } from "../providers/openai.js";

export const chatWithAI = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: "Missing or invalid input text" });
    }

    // Limit input length to prevent abuse
    if (text.length > 1000) {
      return res.status(400).json({ message: "Input text exceeds maximum length" });
    }

    const response = await createMessages(text);

    if (!response) {
      return res.status(500).json({ message: "Failed to get AI response" });
    }

    return res.json({ message: "AI Response", data: response });
  } catch (error) {
    console.error("OpenAI controller error:", error.message);
    return res.status(500).json({ message: "Error processing AI request" });
  }
};
