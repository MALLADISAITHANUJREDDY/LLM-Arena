import { ImageGeneratorService, ImageGenerationResult } from './types.js';

export class GeminiService implements ImageGeneratorService {
  async generateImage(prompt: string, seed: number): Promise<ImageGenerationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env['google - gemin'];
    if (!apiKey) {
      throw new Error('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in the server .env file.');
    }

    // gemini-3.1-flash-image is the modern, recommended model for image generation
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Google Gemini API error (Status ${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMsg += `: ${errorJson.error.message}`;
        } else if (errorJson.message) {
          errorMsg += `: ${errorJson.message}`;
        }
      } catch (e) {
        errorMsg += `: ${errorText}`;
      }
      throw new Error(errorMsg);
    }

    const data: any = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: any) => p.inlineData);
    const bytesBase64 = imagePart?.inlineData?.data;

    if (!bytesBase64) {
      // Check if it's a content warning or block
      if (data?.candidates?.[0]?.finishReason) {
        throw new Error(`Gemini Imagen API failed to return image. Finish reason: ${data.candidates[0].finishReason}`);
      }
      throw new Error('No image inlineData returned from Gemini generateContent API.');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    return {
      imageUrl: `data:${mimeType};base64,${bytesBase64}`,
      seed
    };
  }
}
export default GeminiService;
