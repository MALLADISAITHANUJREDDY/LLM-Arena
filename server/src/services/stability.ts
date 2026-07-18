import { ImageGeneratorService, ImageGenerationResult } from './types.js';

export class StabilityService implements ImageGeneratorService {
  async generateImage(prompt: string, seed: number): Promise<ImageGenerationResult> {
    const apiKey = process.env.STABILITY_API_KEY || process.env['sk-7v6SA7hWhhIPhlNfozmijWuZoodER627HcKAmp9W4U9MvWMA'];
    if (!apiKey) {
      throw new Error('Stability AI API Key is missing. Please configure STABILITY_API_KEY in the server .env file.');
    }

    const url = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', '1:1');
    formData.append('output_format', 'png');
    
    // Add seed if it's within Stability's supported seed range [0 .. 4294967295]
    if (seed !== undefined && seed >= 0 && seed <= 4294967295) {
      formData.append('seed', seed.toString());
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Stability AI API error (Status ${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMsg += `: ${errorJson.errors.join(', ')}`;
        } else if (errorJson.message) {
          errorMsg += `: ${errorJson.message}`;
        }
      } catch (e) {
        errorMsg += `: ${errorText}`;
      }
      throw new Error(errorMsg);
    }

    // Stability AI returns binary image data when 'Accept: image/*' is passed
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    // Try to extract returned seed from response headers (if provided by Stability)
    const stabilitySeedHeader = response.headers.get('seed') || response.headers.get('stability-seed');
    const returnedSeed = stabilitySeedHeader ? parseInt(stabilitySeedHeader, 10) : seed;

    return {
      imageUrl,
      seed: isNaN(returnedSeed) ? seed : returnedSeed
    };
  }
}
export default StabilityService;
