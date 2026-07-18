export interface ImageGenerationResult {
  imageUrl: string; // Base64 Data URI or URL
  seed: number;
}

export interface ImageGeneratorService {
  generateImage(prompt: string, seed: number): Promise<ImageGenerationResult>;
}
