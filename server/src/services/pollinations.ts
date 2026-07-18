import { ImageGeneratorService, ImageGenerationResult } from './types.js';

export class PollinationsService implements ImageGeneratorService {
  private styleSuffix: string;

  constructor(styleSuffix: string = '') {
    this.styleSuffix = styleSuffix;
  }

  async generateImage(prompt: string, seed: number): Promise<ImageGenerationResult> {
    const finalPrompt = this.styleSuffix ? `${prompt}, ${this.styleSuffix}` : prompt;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pollinations AI error (Status ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return {
      imageUrl,
      seed
    };
  }
}
export default PollinationsService;
