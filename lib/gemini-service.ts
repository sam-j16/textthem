import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeImage(imageFile: Buffer): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    try {
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: "Carefully analyze the text and context of this image. Extract the communication style, tone, typical phrases, emoji usage, and overall communication pattern." },
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

  async generateReply(conversationContext: string, messageStyle: any): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const prompt = `
        Based on the following communication context and style analysis, 
        generate a realistic, contextually appropriate reply that mimics 
        the communication pattern:

        Communication Context: ${conversationContext}
        
        Reply Guidelines:
        - Maintain the exact tone and communication style
        - Use similar emoji patterns
        - Respond as if you are the person being simulated
        - Keep the response natural and conversational
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Reply generation error:", error);
      throw new Error("Failed to generate reply");
    }
  }
}