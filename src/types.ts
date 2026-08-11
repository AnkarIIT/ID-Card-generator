export type FormatType = 'frame' | 'badge';

export type CardSide = 'front' | 'back' | 'both';

export type FrameStyle = 'classic_ring' | 'cyber_brackets' | 'sunset_wave' | 'gold_laurel' | 'minimal_hex';

export type ThemeStyle = 'goa_vintage' | 'goa_sunset' | 'cyber_ocean' | 'obsidian_gold' | 'minimal_white';

export type PhotoFilter = 'none' | 'sunkissed' | 'cyberpunk' | 'cinematic' | 'bw' | 'vivid';

export interface PhotoTransform {
  x: number;       // Offset X in px
  y: number;       // Offset Y in px
  scale: number;   // 0.5 to 3
  rotation: number;// -180 to 180 degrees
  filter: PhotoFilter;
}

export interface BuilderData {
  name: string;
  role: string;
  stack: string;
  builderTitle: string;
  statusTag: string;        // e.g., "VERIFIED BUILDER", "ATTENDING", "HACKER PASS"
  handle: string;           // Twitter handle, e.g., "shashwat_kumar"
  qrUrl: string;            // Link to encode in QR code (e.g. https://x.com/shashwat_kumar)

  // Fun Funky Badge Fields from Reference Poster
  photoMotto: string;       // e.g. "BANWA RAHA HOON HISTORY."
  currentlyBuilding: string;// e.g. "Khud ko aur kuch dhaansu cheezein"
  sideQuest: string;        // e.g. "Startups • Travel • Anime • Food"
  sleepStatus: string;      // e.g. "404: NOT FOUND (Kaam > Neend)"
  chaosLevel: number;       // 0 to 100 (%)
  poweredBy: string;        // e.g. "Chai + Jugaad + Questionable Decisions"
  mostUsedKey: string;      // e.g. "Ctrl + Z"
  favouriteError: string;   // e.g. "404"
  hindiPunchline: string;   // e.g. "करेंगे सबका, छापेंगे अलग!"
  backHeadline: string;     // e.g. "चलो बनाते हैं बवाल वाले आईडियाज़"
}

export interface CardConfig {
  format: FormatType;
  side: CardSide;           // 'front' | 'back' | 'both'
  frameStyle: FrameStyle;
  themeStyle: ThemeStyle;
  builder: BuilderData;
  photoTransform: PhotoTransform;
}

export interface SavedShareResult {
  id: string;
  shareUrl: string;
  ogImageUrl: string;
}

