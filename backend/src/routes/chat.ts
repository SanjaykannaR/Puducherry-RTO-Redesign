import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// ── Gemini setup ──
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

if (GEMINI_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('[chat] Gemini configured OK');
  } catch (e) {
    console.error('[chat] Gemini init failed:', e);
  }
} else {
  console.warn('[chat] GEMINI_API_KEY not set — chat will use fallback responses');
}

// ── Load knowledge base ──
const knowledgeCache: Record<string, any> = {};

function loadKnowledge(lang: string): any {
  if (knowledgeCache[lang]) return knowledgeCache[lang];
  const filePath = path.join(__dirname, '..', 'data', `${lang}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    knowledgeCache[lang] = JSON.parse(raw);
  } catch {
    // Fallback to English
    if (lang !== 'en') return loadKnowledge('en');
    knowledgeCache[lang] = { topics: {}, navigation_intents: {} };
  }
  return knowledgeCache[lang];
}

// ── Language detection (simple keyword-based, no external lib) ──
const TAMIL_RE = /[\u0B80-\u0BFF]/;
const FRENCH_WORDS = /\b(bonjour|salut|bonsoir|merci|comment|pourquoi|permis|voiture|paiement|aide|pouvez|voulez|besoin|aussi|avec|mais|c'est|s'il|nous|je suis|je veux|je peux)\b/i;

function detectLanguage(text: string): 'en' | 'ta' | 'fr' {
  if (TAMIL_RE.test(text)) return 'ta';
  if (FRENCH_WORDS.test(text)) return 'fr';
  return 'en';
}

// ── Knowledge search ──
function searchKnowledge(query: string, lang: string): string {
  const data = loadKnowledge(lang);
  const topics = data.topics || {};
  const queryLower = query.toLowerCase();

  const scored: { score: number; key: string; topic: any }[] = [];

  for (const [key, topic] of Object.entries(topics) as [string, any][]) {
    let score = 0;
    const title = (topic.title || '').toLowerCase();
    const topicStr = JSON.stringify(topic).toLowerCase();

    for (const word of queryLower.split(/\s+/)) {
      if (word.length < 3) continue;
      if (title.includes(word) || key.includes(word)) score += 2;
      if (topicStr.includes(word)) score += 0.5;
    }

    // Boost for common RTO intent keywords
    const intentKeywords: Record<string, string[]> = {
      license: ['license', 'licence', 'dl', 'llr', 'driving'],
      vehicle: ['vehicle', 'registration', 'rc', 'car', 'bike', 'motorcycle'],
      renewal: ['renew', 'renewal', 'expire', 'expired', 'validity'],
      documents: ['document', 'form', 'paper', 'proof', 'required'],
      fees: ['fee', 'cost', 'price', 'charge', 'pay', 'payment', 'rupees', 'rs'],
      challan: ['challan', 'fine', 'penalty', 'violation', 'traffic'],
      appointment: ['appointment', 'slot', 'book', 'visit'],
      medical: ['medical', 'form 1a', 'form 1', 'health', 'doctor', 'fitness', 'age 40', '40+'],
      transfer: ['transfer', 'ownership', 'sell', 'buy', 'second hand'],
      noc: ['noc', 'no objection', 'outside state'],
      helpline: ['contact', 'phone', 'help', 'office', 'address'],
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      for (const kw of keywords) {
        if (queryLower.includes(kw)) {
          if (key.includes(intent) || keywords.slice(0, 2).some((k) => topicStr.includes(k))) {
            score += 1;
          }
        }
      }
    }

    if (score > 0) scored.push({ score, key, topic });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, 3)
    .map(({ key, topic }) => `--- ${topic.title || key} ---\n${JSON.stringify(topic, null, 2)}`)
    .join('\n\n') || 'No specific RTO topic found for this query.';
}

// ── Navigation intent detection ──
function getNavigationIntent(query: string, lang: string): { path: string; hint: string } | null {
  const data = loadKnowledge(lang);
  const navIntents = data.navigation_intents || {};
  const q = query.toLowerCase();

  const goKeywords = ['go to', 'take me', 'navigate', 'open', 'show me', 'where is', 'link for', 'page for'];
  const wantsNav = goKeywords.some((kw) => q.includes(kw));
  if (!wantsNav) return null;

  const navKeywords: Record<string, string[]> = {
    services: ['service', 'services'],
    license: ['license', 'licence', 'dl', 'llr'],
    vehicle: ['vehicle', 'registration', 'rc'],
    appointment: ['appointment', 'book', 'schedule'],
    challan: ['challan', 'fine', 'penalty'],
    calculator: ['calculator', 'fee calculator'],
    directory: ['directory', 'offices'],
    fares: ['fare', 'fees', 'fee structure'],
    contact: ['contact', 'phone', 'email', 'address'],
    login: ['login', 'sign in', 'log in'],
    register: ['register', 'sign up'],
    dashboard: ['dashboard', 'my account', 'profile'],
    home: ['home', 'main page'],
  };

  for (const [destKey, keywords] of Object.entries(navKeywords)) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        const intent = navIntents[destKey];
        if (intent) return intent;
      }
    }
  }
  return null;
}

// ── System prompts ──
const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a helpful AI assistant for the Puducherry RTO portal. Help citizens with:
1. Driving License (new, renewal, duplicate, address change)
2. Learner's License (LLR)
3. Vehicle Registration & RC Renewal
4. Traffic challans and penalties
5. Fees, documents, and step-by-step processes
6. Navigation on this portal

RULES:
- Respond in the SAME LANGUAGE as the user
- Be concise, use numbered steps for processes
- Always mention fees in Indian Rupees (Rs.)
- If user asks about age 40+ license renewal, ALWAYS mention Form 1A medical certificate
- If user wants to apply, suggest they log in first
- Keep responses under 300 words
- Be friendly and patient`,

  ta: `நீங்கள் புதுச்சேரி ஆர்.டி.ஓ போர்ட்டலுக்கான AI உதவியாளர். குடிமக்களுக்கு உதவுங்கள்:
1. ஓட்டுநர் உரிமம் (புதிய, புதுப்பித்தல், நகல்)
2. கற்றோர் உரிமம் (எல்.எல்.ஆர்.)
3. வாகன பதிவு & ஆர்.சி. புதுப்பித்தல்
4. போக்குவரத்து சால்லன் மற்றும் அபராதங்கள்
5. கட்டணங்கள், ஆவணங்கள், படிப்படியான செயல்முறை

விதிகள்:
- பயனரின் மொழியில் பதிலளிக்கவும்
- சுருக்கமாக இருங்கள், படிகளை பயன்படுத்துங்கள்
- 40+ வயது புதுப்பித்தல் என்றால் Form 1A மருத்துவ சான்றிதழ் குறிப்பிடவும்
- 300 சொற்களுக்குள் வையுங்கள்`,

  fr: `Vous êtes un assistant IA pour le portail RTO de Pondichéry. Aidez les citoyens avec :
1. Permis de conduire (nouveau, renouvellement, double)
2. Permis d'apprenti (LLR)
3. Immatriculation de véhicules
4. Contraventions et pénalités
5. Frais, documents, processus étape par étape

RÈGLES :
- Répondez dans la MÊME LANGUE que l'utilisateur
- Soyez concis, utilisez des étapes numérotées
- Si l'utilisateur a 40+ ans, mentionnez TOUJOURS le certificat médical Formulaire 1A
- Réponses sous 300 mots`,
};

const GREETINGS: Record<string, string> = {
  en: "Hello! I'm the Puducherry RTO Assistant. How can I help you today?",
  ta: 'வணக்கம்! நான் புதுச்சேரி ஆர்.டி.ஓ உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  fr: "Bonjour ! Je suis l'assistant RTO de Pondichéry. Comment puis-je vous aider aujourd'hui ?",
};

const ERROR_MSGS: Record<string, string> = {
  en: "Sorry, something went wrong. Please try again or contact our helpline: +91 413 222 1234",
  ta: 'மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும் அல்லது ஹெல்ப்லைனை தொடர்பு கொள்ளவும்: +91 413 222 1234',
  fr: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre assistance : +91 413 222 1234",
};

// ── Chat endpoint ──
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, language, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect language
    const lang = (language && ['en', 'ta', 'fr'].includes(language))
      ? language
      : detectLanguage(message);

    // Greeting shortcut
    const greetingWords: Record<string, string[]> = {
      en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      ta: ['வணக்கம்', 'ஹலோ', 'வாழ்த்துக்கள்'],
      fr: ['bonjour', 'salut', 'bonsoir'],
    };
    const isGreeting = greetingWords[lang]?.some((kw) => message.toLowerCase().includes(kw)) && message.split(/\s+/).length < 5;
    if (isGreeting) {
      return res.json({ response: GREETINGS[lang], language: lang, navigation: null, login_suggested: false });
    }

    // Navigation intent
    const navigation = getNavigationIntent(message, lang);

    // If no Gemini, return fallback
    if (!model) {
      return res.json({
        response: ERROR_MSGS[lang],
        language: lang,
        navigation,
        login_suggested: false,
      });
    }

    // Build prompt
    const kbContext = searchKnowledge(message, lang);
    const sysPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;

    let prompt = `System: ${sysPrompt}\n\n--- RTO Knowledge Base ---\n${kbContext}\n--- End ---\n`;

    if (history && Array.isArray(history) && history.length > 0) {
      prompt += '\n--- Conversation History ---\n';
      for (const msg of history.slice(-6)) {
        prompt += `${msg.role}: ${msg.content}\n`;
      }
      prompt += '--- End ---\n';
    }

    if (navigation) {
      prompt += `\n[Navigation detected: ${navigation.hint}. Path: ${navigation.path}]\n`;
    }

    prompt += `\nUser: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Check login suggestion
    const loginKeywords: Record<string, string[]> = {
      en: ['log in', 'login', 'sign in', 'apply', 'register'],
      ta: ['உள்நுழை', 'விண்ணப்பிக்க', 'பதிவு'],
      fr: ['connecter', 'appliquer', "s'inscrire"],
    };
    const loginSuggested = loginKeywords[lang]?.some((kw) => responseText.toLowerCase().includes(kw)) || false;

    return res.json({
      response: responseText,
      language: lang,
      navigation,
      login_suggested: loginSuggested,
    });
  } catch (err: any) {
    console.error('[chat] Error:', err?.message || err);
    const lang = detectLanguage(req.body?.message || '');
    return res.json({
      response: ERROR_MSGS[lang],
      language: lang,
      navigation: null,
      login_suggested: false,
    });
  }
});

// ── Chat health ──
router.get('/chat/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'chat-api', gemini: !!model });
});

// ── Chat debug — try a Gemini call and show the error ──
router.get('/chat/debug', async (_req: Request, res: Response) => {
  if (!model) return res.json({ error: 'No Gemini model', keySet: !!GEMINI_KEY });
  try {
    const result = await model.generateContent('Say hello in one word.');
    return res.json({ ok: true, text: result.response.text() });
  } catch (err: any) {
    return res.json({ error: err?.message || String(err), stack: err?.stack?.split('\n').slice(0, 5) });
  }
});

export default router;
