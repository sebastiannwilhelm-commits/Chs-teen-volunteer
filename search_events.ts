import { GoogleGenAI } from "@google/genai";

async function search() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "Find the exact date and time for the next upcoming volunteer event or orientation for 'Charleston Animal Society' and 'Lowcountry Food Bank'. Provide the date, time, and a brief description.",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  console.log(response.text);
}

search().catch(console.error);
