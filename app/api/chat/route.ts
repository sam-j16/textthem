import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { message, analysis } = await request.json();

    if (!message || !analysis) {
      return NextResponse.json(
        { error: 'Message and analysis are required' },
        { status: 400 }
      );
    }

    // Initialize Gemini service with API key from environment variable
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    
    // Generate a reply based on the user message and the analysis
    const prompt = `
      Based on the following communication style analysis and the user's message,
      generate a response that mimics the communication pattern:

      Communication Style Analysis: ${analysis}
      
      User Message: ${message}
      
      Reply Guidelines:
      - Maintain the exact tone and communication style from the analysis
      - Use similar emoji patterns if present in the analysis
      - Respond as if you are the person being simulated
      - Keep the response natural and conversational
      - Keep the response concise and appropriate for a text message
    `;

    const reply = await geminiService.generateReply(message, prompt);

    return NextResponse.json({
      reply: reply
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process message' },
      { status: 500 }
    );
  }
} 