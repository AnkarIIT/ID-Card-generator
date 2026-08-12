# 🌴 Hacker House Goa 2026 — ID Card & Profile Frame Generator

An interactive, high-fidelity web application to generate custom profile picture (PFP) frames and double-sided digital ID badges for attendees and builders of **Hacker House Goa 2026**.

Developed using **React 19**, **TypeScript**, **Tailwind CSS**, and **Express**, with AI-powered title generation backed by **Gemini 2.5 Flash**.

---

## 🚀 Key Features

*   **Format Selection:** Generate either a square **Profile Frame (PFP Overlay)** or a vertical **Hacker ID Badge** (with toggleable front and back views).
*   **Procedural Design Themes:** Pick from premium visual styles including:
    *   *Goa Vintage* (warm retro colors)
    *   *Goa Sunset* (vibrant warm gradients)
    *   *Cyber Ocean* (neon blues & dark aquas)
    *   *Obsidian Gold* (sleek luxury gold accents)
    *   *Minimal White* (clean modern aesthetic)
*   **Frame Accents:** Apply custom borders such as *Classic Ring*, *Cyber Brackets*, *Sunset Wave*, *Gold Laurel*, and *Minimal Hex*.
*   **Interactive Photo Editor:** Upload profile photos, adjust position (X/Y pan), scale (0.5x to 3x), rotate (-180° to 180°), and apply Instagram-style filters (*Sunkissed*, *Cyberpunk*, *Cinematic*, *B&W*, *Vivid*).
*   **HEIC Support:** Native conversion of `.heic` and `.heif` images (default iPhone photo formats) directly in-browser using `heic2any`.
*   **Smart AI Title Generator:** Automatically generate funny, hyper-targeted, and badass developer/builder titles (e.g. *ZK Alchemist*, *Rust Byte Sorcerer*) using **Gemini 2.5 Flash** based on the builder's name, role, and tech stack.
*   **High-Resolution Canvas Export:** Instant server-side or client-side image rendering to high-res PNG for download.
*   **Dynamic Social Sharing (OG Image Engine):** Save card configurations to an in-memory Express store, generating unique shareable links. The backend dynamically serves customized Open Graph (OG) image meta tags so link previews render beautifully on X (Twitter), LinkedIn, WhatsApp, and Facebook.

---

## 🛠️ Tech Stack

*   **Frontend:**
    *   **React 19 & TypeScript**
    *   **Vite** (Next-generation frontend toolchain)
    *   **Tailwind CSS v4** (Modern utility-first CSS framework)
    *   **Motion/React** (Hardware-accelerated animations)
    *   **Lucide React** (Crisp vector icons)
    *   **Canvas Confetti** (Rewarding action effects)
*   **Backend:**
    *   **Express** (Node.js web framework serving frontend assets + APIs)
    *   **Google Gen AI SDK** (`@google/genai` library powering title creation)
    *   **Dotenv** (Environment variables management)

---

## 📂 Project Structure

```bash
├── src/
│   ├── components/
│   │   ├── experience/
│   │   │   ├── Hero.tsx            # Cinematic hero entry page
│   │   │   ├── LiveCard.tsx        # Interactive, animated 3D card preview
│   │   │   ├── PhotoStep.tsx       # Photo upload step with slider controls
│   │   │   ├── LoreStep.tsx        # Lore/info inputs & AI Title generator
│   │   │   └── VibeStep.tsx        # Vibe & image filter selector
│   │   ├── GraphicPreview.tsx      # Dual-canvas container for rendering & exporting
│   │   ├── BadgeForm.tsx          # Form field layouts & controls
│   │   └── ...                     # Layout & selector utilities
│   ├── utils/
│   │   ├── canvasRenderer.ts       # Procedural 2D Canvas drawing script
│   │   ├── heicConverter.ts        # Client-side HEIC-to-PNG utility
│   │   └── urlUtils.ts             # Social media & helper URL utilities
│   ├── types.ts                    # Card config & data models
│   ├── main.tsx                    # React application mount
│   └── index.css                   # Custom stylesheets & CRT scanline animations
├── server.ts                       # Node.js backend & API handler (Gemini + OG)
├── vite.config.ts                  # Vite compilation configurations
├── package.json                    # Dependencies & automation scripts
└── README.md                       # Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   An active Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository and navigate to the directory
```bash
git clone <repository_url>
cd HHGoa
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## ⚡ Running the App

### Development Mode
Runs both the Vite development server and the Express backend concurrently:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Build and Run for Production
Builds the client-side bundles and compiles the Express server:
```bash
npm run build
npm start
```

---

## 🔒 License
This project is open-source. Feel free to modify and build upon it! 🚀
