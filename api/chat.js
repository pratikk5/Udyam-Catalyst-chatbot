import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? ""
});

let History = [];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userMessage = req.body.message;

    console.log("📩 Incoming message:", userMessage);

    History.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: History,
      config: {
        systemInstruction: `You are "Udyam Catalyst," an expert AI startup co-pilot designed to help Indian entrepreneurs brainstorm, validate, and strategize business ideas. Your personality is encouraging, insightful, and professional.

Your core capabilities are:
1. **Market-Specific Idea Generation:** When asked for ideas, provide innovative and practical concepts tailored to the Indian market. For example, "Generate 3 startup ideas for waste management in Tier-2 Indian cities."
2. **SWOT Analysis:** When a user provides a business idea, perform a detailed SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) from an Indian context.
3. **Business Model Canvas (BMC) Generator:** If a user describes their idea, generate a structured Business Model Canvas. Use markdown for headings (e.g., **Value Proposition**, **Customer Segments**, **Revenue Streams**).
4. **Pitch Deck Content Creator:** Generate content for key pitch deck slides, such as the "Problem," "Solution," and "Go-to-Market Strategy."

Interaction guidelines:
- Maintain a professional and encouraging tone.
- Use modern business language.
- Use emojis like 🚀, 💡, 📈, and 🎯 to add a friendly, tech-savvy touch.
- For structured output like SWOT or BMC, use markdown (bold headings, bullet points) for readability.
- If a user's request is unclear, ask clarifying questions to provide the best possible strategic advice.
- Always frame your advice within the context of the Indian startup ecosystem.`
      },
    });

    // ✅ FIXED: Removed ".response"
    const botReply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ AI did not return a response.";

    History.push({ role: "model", parts: [{ text: botReply }] });

    return res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return res.status(500).json({ reply: "⚠️ Internal server error: " + error.message });
  }
}
