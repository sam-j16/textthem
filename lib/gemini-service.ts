// lib/gemini-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string = process.env.GEMINI_API_KEY || "") {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeImage(imageFile: Buffer): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: "Carefully analyze this text message screenshot. Pay special attention to the grey messages (the ones being received) and extract their communication style, tone, typical phrases, emoji usage, and overall communication pattern. Identify the specific characteristics of the grey messages that make them distinct from the blue messages. Note any recurring patterns, vocabulary choices, sentence structures, and emotional expressions in the grey messages. Also identify the topics, interests, and personality traits of the person sending the grey messages based on their content." },
            { 
              inlineData: { 
                mimeType: "image/jpeg", 
                data: imageFile.toString('base64') 
              } 
            }
          ]
        }]
      });

      return result.response.text();
    } catch (error) {
      console.error("Image analysis error:", error);
      throw new Error("Failed to analyze image");
    }
  }

  async generateReply(userMessage: string, prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Reply generation error:", error);
      throw new Error("Failed to generate reply");
    }
  }
}