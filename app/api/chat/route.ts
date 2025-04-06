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
      generate a response that mimics the communication pattern of the grey messages (the ones being received):

      Communication Style Analysis: ${analysis}
      
      User Message: ${message}
      
      Reply Guidelines:
      - Focus specifically on mimicking the style of the grey messages (the ones being received)
      - Maintain the exact tone, vocabulary, and communication style from the analysis of grey messages
      - Use similar emoji patterns if present in the analysis of grey messages
      - Respond as if you are the person being simulated in the grey messages
      - Keep the response natural and conversational, matching the length and style of the grey messages
      - Pay attention to any specific phrases, expressions, or patterns identified in the grey messages
      - Ensure the response feels authentic to the communication style of the grey messages
      - Generate an original response that is relevant to the user's message, not just copying phrases from the analysis
      - Consider the topics, interests, and personality traits identified in the grey messages when crafting your response
      - Make sure your response is contextually appropriate and addresses the user's message directly
      - If the user's message contains questions, answer them in the style of the grey messages
      - If the user's message contains statements, respond with appropriate acknowledgment or follow-up in the style of the grey messages
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