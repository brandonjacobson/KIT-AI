import { Router, type Request, type Response } from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const router = Router();

// Initialize ElevenLabs client
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY || API_KEY === 'your_elevenlabs_api_key_here') {
  console.warn('⚠️  ELEVENLABS_API_KEY not configured in backend/.env');
}

const client = API_KEY && API_KEY !== 'your_elevenlabs_api_key_here'
  ? new ElevenLabsClient({ apiKey: API_KEY })
  : null;

/**
 * POST /api/tts/convert
 * Request body: { text: string, voiceId?: string }
 * Returns: Audio blob (audio/mpeg)
 */
router.post("/convert", async (req: Request, res: Response) => {
  try {
    if (!client) {
      res.status(503).json({
        error: "Text-to-Speech service not configured. Please set ELEVENLABS_API_KEY in backend/.env"
      });
      return;
    }

    const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb', languageCode } = req.body; // George - works on free tier

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (text.length > 5000) {
      res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
      return;
    }

    // Generate audio using ElevenLabs with flash model for maximum speed
    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_flash_v2_5', // Fastest model available
      outputFormat: 'mp3_22050_32',  // Lower quality = faster generation
      ...(languageCode && { languageCode }) // Pass language code if provided for better pronunciation
    });

    // Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');

    for await (const chunk of audio) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('TTS conversion error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate audio'
    });
  }
});

/**
 * GET /api/tts/voices
 * Returns: List of available voices
 */
router.get("/voices", async (_req: Request, res: Response) => {
  // Return only free-tier compatible voices to avoid 402 errors
  res.json({
    voices: [
      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', descriptionKey: 'voiceGeorge', category: 'premade' },
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', descriptionKey: 'voiceRachel', category: 'premade' },
      { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', descriptionKey: 'voiceDaniel', category: 'premade' },
      { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', descriptionKey: 'voiceCharlotte', category: 'premade' },
      { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', descriptionKey: 'voiceLily', category: 'premade' }
    ]
  });
});

/**
 * GET /api/tts/health
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: client ? 'ok' : 'not_configured',
    message: client ? 'TTS service ready' : 'ELEVENLABS_API_KEY not configured'
  });
});

export default router;
