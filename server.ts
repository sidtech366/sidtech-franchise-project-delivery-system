import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gemini API SDK on the server-side
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Admin AI Copilot intent parser endpoint
app.post('/api/gemini/admin-action', async (req, res) => {
  try {
    const { prompt, currentModule, context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      // If API key is not configured, inform client to use internal deterministic engine
      return res.json({
        fallback: true,
        message: 'No server-side GEMINI_API_KEY found. Using internal high-precision parser.',
      });
    }

    const systemInstruction = `
You are the SidTech Enterprise Admin AI Copilot. The admin can give instructions in English, Hindi, or Hinglish (e.g., "Sabhi pending franchise approve kar do", "ST366-0001 ke wallet me 5000 add kar do", "Service SRV-0001 ka price 2500 kar do", "Ek naya service add karo: AI Agent Development, price 45000, 30% advance").

Based on the admin's prompt and current active module ("${currentModule}"), you must map the command to one of the following structured JSON actions:

Action Types:
1. UPDATE_WALLET: { franchiseId: string, amount: number, mode: "add" | "set", note?: string }
2. APPROVE_FRANCHISE: { franchiseId: string }
3. APPROVE_ALL_PENDING: {}
4. REJECT_FRANCHISE: { franchiseId: string, reason?: string }
5. UPDATE_PROJECT_STATUS: { projectId: string, status: "New" | "Accepted" | "Processing" | "DemoReady" | "Delivered" | "Rejected", demoUrl?: string, finalUrl?: string }
6. VERIFY_PAYMENT: { paymentId: string }
7. VERIFY_ALL_PAYMENTS: {}
8. ADD_SERVICE: { serviceName: string, price: number, advancePercent?: number, commissionPercent?: number, category?: "Website" | "App" | "Software" | "ERP" | "Other", description?: string }
9. UPDATE_SERVICE: { serviceId: string, price?: number, active?: boolean, advancePercent?: number, commissionPercent?: number }
10. UPDATE_SETTINGS: { companyUpi?: string, supportPhone?: string, defaultAdvancePercent?: number, companyName?: string }
11. PROCESS_PAYOUT: { payoutId: string, status: "Processing" | "Paid", referenceNote?: string }
12. UPDATE_FRANCHISE_DETAILS: { franchiseId: string, mobile?: string, branchName?: string, address?: string, name?: string }

Output only valid JSON with this exact structure:
{
  "actionType": "THE_ACTION_TYPE",
  "explanation": "Brief explanation in English or Hinglish of what was updated",
  "payload": { ... }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Current Section: ${currentModule}\nSystem Context: ${JSON.stringify(context || {})}\nAdmin Prompt: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsedAction = JSON.parse(responseText.trim());

    return res.json({
      success: true,
      action: parsedAction,
    });
  } catch (error: any) {
    console.error('Gemini Admin Action Error:', error);
    return res.json({
      fallback: true,
      error: error?.message || 'Server AI processing error',
    });
  }
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SidTech Enterprise Server running on port ${PORT}`);
  });
}

startServer();
