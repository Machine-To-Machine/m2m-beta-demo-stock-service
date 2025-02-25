import OpenAI from "openai";

// Check for API key at initialization
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not defined in environment variables");
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4-0125-preview";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createMessages = async (text) => {
  if (!text || typeof text !== 'string') {
    return "Invalid input provided";
  }

  try {
    const messages = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a chatbot, Please reply politely to the following questions.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 500, // Limit response size
    });
    return messages.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    return "Sorry, I couldn't process your request at this time.";
  }
};
