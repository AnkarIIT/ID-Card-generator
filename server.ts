import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for high-res base64 image uploads
app.use(express.json({ limit: '25mb' }));

// Store generated graphics in memory (and optional temporary cache)
interface SavedCard {
  id: string;
  type: 'frame' | 'badge';
  name: string;
  role: string;
  stack: string;
  builderTitle: string;
  imageDataUrl: string; // Base64 data URL (png)
  createdAt: number;
}

const cardsStore = new Map<string, SavedCard>();

// Clean up cards older than 24 hours every hour to keep memory footprint light
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  for (const [id, card] of cardsStore.entries()) {
    if (now - card.createdAt > maxAge) {
      cardsStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

// API Endpoint to save generated graphic & generate share ID
app.post('/api/share', (req, res) => {
  try {
    const { type, name, role, stack, builderTitle, imageDataUrl } = req.body;
    if (!imageDataUrl) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Create unique ID
    const id = Math.random().toString(36).substring(2, 10);
    const savedCard: SavedCard = {
      id,
      type: type || 'badge',
      name: name || 'HH Goa Builder',
      role: role || 'Hacker',
      stack: stack || 'Full Stack',
      builderTitle: builderTitle || 'Goa Pioneer',
      imageDataUrl,
      createdAt: Date.now(),
    };

    cardsStore.set(id, savedCard);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      id,
      shareUrl: `${baseUrl}/share/${id}`,
      ogImageUrl: `${baseUrl}/api/og/${id}`,
    });
  } catch (err: any) {
    console.error('Error in /api/share:', err);
    res.status(500).json({ error: 'Failed to create share card' });
  }
});

// Endpoint to retrieve raw OG Image PNG for meta tags and Twitter cards
app.get('/api/og/:id', (req, res) => {
  const { id } = req.params;
  const card = cardsStore.get(id);

  if (!card || !card.imageDataUrl) {
    // Return a default SVG image placeholder if not found
    const fallbackSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a0b10"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#00f2fe" font-size="52" font-family="sans-serif" font-weight="bold">HH GOA 2026</text>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="32" font-family="sans-serif">Builder Frame &amp; ID Card Generator</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(fallbackSvg);
  }

  // Parse data URL to buffer
  const matches = card.imageDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).send('Invalid image format');
  }

  const imageType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  res.setHeader('Content-Type', imageType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(buffer);
});

// AI Endpoint for Title Generation using Gemini
app.post('/api/generate-title', async (req, res) => {
  try {
    const { name, role, stack } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart fallback options if key is missing
      const fallbackTitles = [
        `${stack ? stack.split('/')[0].trim() : 'Tech'} Sorcerer`,
        `HH Goa ${role || 'Builder'} Maestro`,
        `Goa Protocol Specialist`,
        `High-Octane ${stack || 'Dev'} Architect`,
      ];
      return res.json({ titles: fallbackTitles });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the ultimate tech hype maker for HH Goa 2026, an epic developer hackathon in Goa, India.
Generate 4 short, cool, badass, memorable "Builder Titles" (2 to 4 words max) for a builder badge based on:
Name: ${name || 'Builder'}
Role: ${role || 'Software Engineer'}
Stack: ${stack || 'Full Stack'}

Rules:
- Make them creative, punchy, exciting! Examples: "Solana ZK Alchemist", "Rust Byte Sorcerer", "Full-Stack Wave Rider", "AI Agent Constructor", "Goa Yield Architect", "DeFi Byte Ninja".
- Return JSON array of 4 strings only. No markdown formatting outside json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let titles = [];
    try {
      titles = JSON.parse(text);
    } catch {
      titles = [
        `${stack || 'Goa'} Byte Craftsman`,
        `HH Goa Protocol Lead`,
        `Full-Stack Wave Maker`,
        `Goa AI Innovator`,
      ];
    }

    if (!Array.isArray(titles) || titles.length === 0) {
      titles = [
        `${stack || 'Goa'} Byte Craftsman`,
        `HH Goa Protocol Lead`,
        `Full-Stack Wave Maker`,
        `Goa AI Innovator`,
      ];
    }

    res.json({ titles });
  } catch (err: any) {
    console.error('Gemini API title generation error:', err);
    res.json({
      titles: [
        'Goa Hacker Extraordinaire',
        'Protocol Craft Architect',
        'Full-Stack Wave Sorcerer',
        'HH Goa Pioneer 2026',
      ],
    });
  }
});

// HTML Share route for social media link previews
app.get('/share/:id', (req, res, next) => {
  const { id } = req.params;
  const card = cardsStore.get(id);

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const ogImageUrl = `${baseUrl}/api/og/${id}`;
  const sharePageUrl = `${baseUrl}/share/${id}`;

  const title = card ? `${card.name}'s HH Goa 2026 ${card.type === 'badge' ? 'Builder Badge' : 'Profile Frame'}` : 'HH Goa 2026 Builder Card';
  const description = card
    ? `${card.name} (${card.builderTitle}) is attending HH Goa 2026! Stack: ${card.stack}. Create your own HH Goa graphic now!`
    : 'Create your custom HH Goa 2026 profile picture overlay frame or builder badge!';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>

  <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${sharePageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${sharePageUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImageUrl}" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      color: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .card-container {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 24px;
      max-width: 540px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
    }
    .card-img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      margin-bottom: 20px;
    }
    h1 {
      font-size: 1.5rem;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #38bdf8, #818cf8, #f43f5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    .btn-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 9999px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #6366f1);
      color: white;
      border: none;
    }
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="card-container">
    <img src="${ogImageUrl}" alt="${title}" class="card-img" />
    <h1>${card ? card.name : 'HH Goa 2026'}</h1>
    <p>${card ? `${card.builderTitle} • ${card.stack}` : 'Create your official HH Goa 2026 Graphic'}</p>
    <div class="btn-group">
      <a href="${ogImageUrl}" download="HH_Goa_2026_${id}.png" class="btn btn-secondary">Download Graphic</a>
      <a href="/" class="btn btn-primary">Create Your Own Badge</a>
    </div>
  </div>
</body>
</html>`;

  res.send(html);
});

async function startServer() {
  // Vite integration in development mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HH Goa 2026 Generator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
