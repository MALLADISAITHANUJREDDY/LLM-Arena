import { ImageGeneratorService, ImageGenerationResult } from './types.js';

export class CloudflareService implements ImageGeneratorService {
  private modelId: string;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  async generateImage(prompt: string, seed: number): Promise<ImageGenerationResult> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare credentials missing. Please configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in backend .env.');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${this.modelId}`;

    const body: any = {
      prompt
    };
    
    // Add seed if supported
    if (seed !== undefined && seed >= 0) {
      body.seed = seed;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Cloudflare API error (Status ${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMsg += `: ${errorJson.errors[0].message || JSON.stringify(errorJson.errors)}`;
        } else if (errorJson.message) {
          errorMsg += `: ${errorJson.message}`;
        }
      } catch (e) {
        errorMsg += `: ${errorText}`;
      }
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Cloudflare Flux Schnell and other models return data inside a JSON response
    if (contentType.includes('application/json')) {
      const json: any = await response.json();
      
      if (!json.success || (json.errors && json.errors.length > 0)) {
        const errorDetails = json.errors?.[0]?.message || JSON.stringify(json.errors || json);
        throw new Error(`Cloudflare error: ${errorDetails}`);
      }

      const base64 = json?.result?.image;
      if (!base64) {
        throw new Error('No image returned in Cloudflare JSON response.');
      }

      return {
        imageUrl: `data:image/jpeg;base64,${base64}`,
        seed
      };
    }

    // Fallback: If Cloudflare returns binary image stream directly (e.g. for SDXL Base/Lightning)
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = contentType.includes('image/jpeg') ? 'image/jpeg' : 'image/png';

    return {
      imageUrl: `data:${mimeType};base64,${base64}`,
      seed
    };
  }
}
export default CloudflareService;
