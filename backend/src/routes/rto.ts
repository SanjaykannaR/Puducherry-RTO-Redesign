// ── RTO AI-powered routes ──
// POST /api/rto/assistant       – conversational AI assistant for citizens
// POST /api/rto/verify-document – AI document verification via image upload
//
// Both endpoints use the @google/generative-ai SDK (gemini-1.5-flash).

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// ── Multer config ──
// In-memory storage so we can pass the buffer straight to Gemini.
// Accepts only image MIME types; 5 MB limit per file.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are accepted'));
    }
  },
});

// ── Shared: helper to get a configured Gemini model ──
function getGeminiModel(systemInstruction?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

// ──────────────────────────────────────────────
// POST /assistant
// ──────────────────────────────────────────────
// Accepts { userMessage, currentStep? } and returns AI-generated advice
// for citizens interacting with the Puducherry Transport Department.

const ASSISTANT_SYSTEM_INSTRUCTION = `You are an expert, polite, and helpful assistant for the Puducherry Transport Department (RTO). Your role is to assist Indian citizens with queries related to:

1. **Driving Licences** – application process, learner's permit, slot booking, renewals, duplicates, and driving test tips.
2. **Vehicle Registration** – new registration, transfer of ownership, temporary registration, number plate rules, and registration certificate (RC) details.
3. **Road Tax** – tax calculation, payment methods, exemptions, and due-date reminders.
4. **General RTO Services** – forms, required documents, fee schedules, office hours, and contact information.

Always respond in clear, friendly, and professional language. Use bullet points or short paragraphs for readability. If you do not know a specific rule or fee, direct the citizen to the official Puducherry RTO website or advise them to visit the nearest RTO office. Never make up specific fees, dates, or legal requirements — instead, give general guidance and suggest verified sources.`;

router.post('/assistant', async (req: Request, res: Response) => {
  try {
    const { userMessage, currentStep } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      res.status(400).json({ error: 'userMessage is required and must be a string' });
      return;
    }

    // Build the user prompt — include currentStep context if provided
    const userPrompt =
      typeof currentStep === 'string' && currentStep.length > 0
        ? `The citizen is currently on the "${currentStep}" step.\n\nTheir question:\n${userMessage}`
        : userMessage;

    const model = getGeminiModel(ASSISTANT_SYSTEM_INSTRUCTION);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    res.json({ response: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get AI response';
    console.error('[assistant] Error:', message);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────
// POST /verify-document
// ──────────────────────────────────────────────
// Accepts a multipart image upload (field: "document") and asks Gemini
// whether it is a valid, legible government-issued ID.
// Returns { isValid: boolean, reason: string }.

const VERIFY_PROMPT = `Analyze this image. Is it a clear, legible government-issued identification document such as an Aadhaar Card, Driving Licence, PAN Card, or Passport? Return your response strictly as a JSON object with two fields: 'isValid' (boolean) and 'reason' (a 1-sentence polite explanation if invalid, or a confirmation of the document type found if valid).`;

router.post('/verify-document', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No document image uploaded. Use field name "document".' });
      return;
    }

    // Validate MIME type (belt-and-suspenders — multer filter already blocks)
    if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      res.status(400).json({ error: 'Only JPEG and PNG images are accepted' });
      return;
    }

    const model = getGeminiModel();

    // Build the multimodal payload: prompt string + inline image data
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([VERIFY_PROMPT, imagePart]);
    const rawText = result.response.text();

    // The model may wrap JSON in markdown fences — strip them
    const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate shape
    if (typeof parsed.isValid !== 'boolean' || typeof parsed.reason !== 'string') {
      throw new Error('Gemini response did not contain the expected fields');
    }

    res.json({ isValid: parsed.isValid, reason: parsed.reason });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify document';
    console.error('[verify-document] Error:', message);
    res.status(500).json({ error: message });
  }
});

export default router;
