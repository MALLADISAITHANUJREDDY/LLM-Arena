import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeminiService } from './services/gemini.js';
import { StabilityService } from './services/stability.js';
import { CloudflareService } from './services/cloudflare.js';
import { PollinationsService } from './services/pollinations.js';
import { ImageGeneratorService } from './services/types.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Modular map of services
const servicesMap: Record<string, ImageGeneratorService> = {
  'gemini-image': new GeminiService(),
  'stable-diffusion-3': new StabilityService(),
  'gpt-image': new PollinationsService('in style of dall-e 3, clean illustration style'),
  'midjourney': new PollinationsService('photographic, cinematic depth of field, dramatic lights'),
  'flux': new PollinationsService('synthwave cyberpunk neon aesthetics'),
  'ideogram': new PollinationsService('typography graphic poster style'),

  // Cloudflare Workers AI models
  'cf-flux-1-schnell': new CloudflareService('@cf/black-forest-labs/flux-1-schnell'),
  'cf-sdxl-lightning': new CloudflareService('@cf/bytedance/stable-diffusion-xl-lightning'),
  'cf-sdxl-base-1.0': new CloudflareService('@cf/stabilityai/stable-diffusion-xl-base-1.0'),
  'cf-dreamshaper-8-lcm': new CloudflareService('@cf/lykon/dreamshaper-8-lcm')
};

// Helper to generate image with layered fallbacks (Selected Model -> Pollinations -> SVG)
async function generateImageWithFallback(
  service: ImageGeneratorService,
  modelId: string,
  prompt: string,
  seed: number
): Promise<{ imageUrl: string; seed: number; fallbackMessage: string | null }> {
  try {
    console.log(`[Image Arena] Attempting generation for primary model: ${modelId}`);
    const result = await service.generateImage(prompt, seed);
    return {
      imageUrl: result.imageUrl,
      seed: result.seed,
      fallbackMessage: null
    };
  } catch (primaryError: any) {
    const errorMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
    console.warn(`[Image Arena Warning] Primary model ${modelId} failed: ${errorMsg}. Trying Pollinations fallback...`);
    
    try {
      // Create a style-specific fallback prompt for pollinations to mimic the original model style
      let styledPrompt = prompt;
      if (modelId === 'flux' || modelId === 'cf-flux-1-schnell') {
        styledPrompt += ', synthwave cyberpunk neon aesthetics, highly detailed';
      } else if (modelId === 'midjourney') {
        styledPrompt += ', photographic, cinematic depth of field, dramatic lights';
      } else if (modelId === 'ideogram') {
        styledPrompt += ', typography graphic poster style';
      } else if (modelId === 'gpt-image') {
        styledPrompt += ', clean illustration style, digital art';
      } else if (modelId === 'stable-diffusion-3' || modelId === 'cf-sdxl-base-1.0' || modelId === 'cf-sdxl-lightning') {
        styledPrompt += ', digital painting, detailed lighting, 4k resolution';
      }
      
      const pollinationsService = new PollinationsService();
      const result = await pollinationsService.generateImage(styledPrompt, seed);
      
      return {
        imageUrl: result.imageUrl,
        seed: result.seed,
        fallbackMessage: `Primary model failed (${errorMsg}). Succeeded via Pollinations fallback.`
      };
    } catch (fallbackError: any) {
      console.error(`[Image Arena Error] Pollinations fallback also failed: ${fallbackError.message}. Rendering custom cyber SVG...`);
      
      // Beautiful SVG data URI as the ultimate fallback so it absolutely NEVER fails
      const cleanPrompt = prompt.replace(/"/g, '&quot;');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <rect width="100%" height="100%" fill="#090d16"/>
        <defs>
          <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#d946ef;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff0055;stop-opacity:1" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 240, 255, 0.07)" stroke-width="1.5"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="512" cy="512" r="300" fill="url(#cyber-grad)" opacity="0.15" filter="blur(60px)"/>
        
        <path d="M 80 120 L 120 80 L 904 80 L 944 120 L 944 904 L 904 944 L 120 944 L 80 904 Z" fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.5"/>
        <path d="M 100 140 L 140 100 L 884 100 L 924 140 L 924 884 L 884 924 L 140 924 L 100 884 Z" fill="none" stroke="#ff0055" stroke-width="1.5" opacity="0.25"/>
        
        <path d="M 80 200 L 80 120 L 160 80 L 240 80" fill="none" stroke="#00f0ff" stroke-width="5" />
        <path d="M 944 764 L 944 904 L 864 944 L 784 944" fill="none" stroke="#ff0055" stroke-width="5" />
        
        <g transform="translate(512, 450)">
          <circle cx="0" cy="0" r="90" fill="#090d16" stroke="url(#cyber-grad)" stroke-width="4" />
          <circle cx="0" cy="0" r="75" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="10 15" />
          <polygon points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" fill="none" stroke="#ff0055" stroke-width="2" />
          <circle cx="0" cy="0" r="15" fill="#00f0ff" opacity="0.8" />
        </g>
        
        <text x="50%" y="610" dominant-baseline="middle" text-anchor="middle" font-family="'Courier New', monospace" font-size="28" fill="#00f0ff" font-weight="900" letter-spacing="4">LLM ARENA IMAGEN</text>
        <text x="50%" y="655" dominant-baseline="middle" text-anchor="middle" font-family="'Courier New', monospace" font-size="16" fill="#d946ef" font-weight="bold" letter-spacing="2">ACTIVE PIPELINE BACKUP MODE</text>
        
        <rect x="150" y="700" width="724" height="80" rx="10" fill="rgba(9, 13, 22, 0.85)" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1.5" />
        <text x="50%" y="740" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-style="italic" fill="#ffffff" opacity="0.95">
          "${cleanPrompt.length > 55 ? cleanPrompt.substring(0, 52) + '...' : cleanPrompt}"
        </text>
        
        <text x="50%" y="820" dominant-baseline="middle" text-anchor="middle" font-family="'Courier New', monospace" font-size="14" fill="#64748b" letter-spacing="1">
          MODEL: ${modelId.toUpperCase()} // SEED: ${seed} // SYSTEM: SECURE_STABLE
        </text>
      </svg>`;
      const base64Svg = Buffer.from(svg).toString('base64');
      
      return {
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        seed,
        fallbackMessage: `Failed entirely. Rendered local cyber SVG.`
      };
    }
  }
}

// Main endpoint for parallel image generation
app.post('/api/generate', async (req, res) => {
  const { prompt, leftModel, rightModel, seedLeft, seedRight } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const leftService = servicesMap[leftModel] || new PollinationsService();
  const rightService = servicesMap[rightModel] || new PollinationsService();

  console.log(`Starting parallel image generation: [Left: ${leftModel}] [Right: ${rightModel}]`);

  // Execute both service calls simultaneously with fallbacks
  const [leftResult, rightResult] = await Promise.allSettled([
    generateImageWithFallback(leftService, leftModel, prompt, seedLeft),
    generateImageWithFallback(rightService, rightModel, prompt, seedRight)
  ]);

  const response: any = {
    left: {},
    right: {}
  };

  // Process Left Panel generation result
  if (leftResult.status === 'fulfilled') {
    response.left = {
      success: true,
      imageUrl: leftResult.value.imageUrl,
      seed: leftResult.value.seed,
      error: leftResult.value.fallbackMessage
    };
  } else {
    // This block should technically never be hit since generateImageWithFallback catches all errors,
    // but serves as a solid type/runtime fallback.
    console.error(`Left generation [${leftModel}] critical unhandled reject:`, leftResult.reason);
    response.left = {
      success: false,
      imageUrl: null,
      seed: seedLeft,
      error: leftResult.reason instanceof Error ? leftResult.reason.message : String(leftResult.reason)
    };
  }

  // Process Right Panel generation result
  if (rightResult.status === 'fulfilled') {
    response.right = {
      success: true,
      imageUrl: rightResult.value.imageUrl,
      seed: rightResult.value.seed,
      error: rightResult.value.fallbackMessage
    };
  } else {
    console.error(`Right generation [${rightModel}] critical unhandled reject:`, rightResult.reason);
    response.right = {
      success: false,
      imageUrl: null,
      seed: seedRight,
      error: rightResult.reason instanceof Error ? rightResult.reason.message : String(rightResult.reason)
    };
  }

  res.json(response);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`LLM Arena backend server running on port ${PORT}`);
});
