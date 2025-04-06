import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    const context = formData.get('context') as string || '';

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Initialize Gemini service
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    
    // Process each image and collect analysis results
    const analysisResults = [];
    let hasError = false;
    let errorMessage = '';

    for (const image of images) {
      if (image instanceof File) {
        try {
          // Convert File to Buffer
          const arrayBuffer = await image.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Analyze the image
          const result = await geminiService.analyzeImage(buffer);
          analysisResults.push(result);
        } catch (error) {
          console.error(`Error analyzing image: ${error}`);
          hasError = true;
          errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
          // Continue processing other images
        }
      }
    }

    // If all images failed, return an error
    if (analysisResults.length === 0) {
      return NextResponse.json(
        { error: errorMessage || 'Failed to analyze any images' },
        { status: 500 }
      );
    }

    // Combine all analysis results
    const combinedAnalysis = analysisResults.join('\n\n');
    
    // Generate a reply based on the analysis
    let reply = '';
    try {
      const prompt = `
        Based on the following communication style analysis, generate a friendly greeting that mimics the communication pattern of the grey messages (the ones being received):

        Communication Style Analysis: ${combinedAnalysis}
        
        Additional Context: ${context}
        
        Reply Guidelines:
        - Focus specifically on mimicking the style of the grey messages (the ones being received)
        - Maintain the exact tone, vocabulary, and communication style from the analysis of grey messages
        - Use similar emoji patterns if present in the analysis of grey messages
        - Keep the response natural and conversational, matching the length and style of the grey messages
        - Pay attention to any specific phrases, expressions, or patterns identified in the grey messages
        - Ensure the response feels authentic to the communication style of the grey messages
        - Generate an original greeting that is relevant to the context provided, not just copying phrases from the analysis
        - Consider the topics, interests, and personality traits identified in the grey messages when crafting your greeting
        - Make sure your greeting is contextually appropriate and sets the right tone for the conversation
        - Keep the response concise and appropriate for a text message
      `;
      
      reply = await geminiService.generateReply('', prompt);
    } catch (error) {
      console.error('Error generating reply:', error);
      // Continue without a reply
    }

    // Return the analysis and reply
    return NextResponse.json({
      analysis: combinedAnalysis,
      reply: reply,
      partialSuccess: hasError
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process images' },
      { status: 500 }
    );
  }
} 