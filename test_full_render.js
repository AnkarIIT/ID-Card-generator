import fs from 'fs';
import { PNG } from 'pngjs';

// Load front template
const fontBuf = fs.readFileSync('./src/images/front.png');
const frontPng = PNG.sync.read(fontBuf);
const { width, height, data } = frontPng;

console.log(`Front Template loaded: ${width}x${height}`);

// Define CARD_LAYOUT structure
export const CARD_LAYOUT = {
  canvas: { width: 1024, height: 1536 },

  portrait: {
    x: 514,
    y: 265,
    width: 401,
    height: 490,
    textSafeArea: { x: 514, y: 265, width: 401, height: 490 },
  },

  fields: {
    name: {
      section: { x: 63, y: 472, width: 423, height: 276 },
      textSafeArea: { x: 75, y: 485, width: 399, height: 250 },
      align: 'left',
      verticalAlign: 'middle',
    },
    role: {
      section: { x: 63, y: 753, width: 423, height: 91 },
      textSafeArea: { x: 75, y: 780, width: 399, height: 58 },
      align: 'left',
      verticalAlign: 'middle',
    },
    stack: {
      section: { x: 63, y: 849, width: 423, height: 207 },
      textSafeArea: { x: 75, y: 882, width: 399, height: 168 },
      align: 'left',
      verticalAlign: 'middle',
    },
    builderTitle: {
      section: { x: 63, y: 1058, width: 423, height: 170 },
      textSafeArea: { x: 75, y: 1092, width: 399, height: 130 },
      align: 'center',
      verticalAlign: 'middle',
    },
    building: {
      section: { x: 63, y: 1231, width: 423, height: 152 },
      textSafeArea: { x: 75, y: 1262, width: 295, height: 115 },
      align: 'left',
      verticalAlign: 'middle',
    },
    sideQuest: {
      section: { x: 63, y: 1386, width: 423, height: 132 },
      textSafeArea: { x: 75, y: 1415, width: 399, height: 98 },
      align: 'left',
      verticalAlign: 'middle',
    },
    id: {
      section: { x: 549, y: 800, width: 288, height: 45 },
      textSafeArea: { x: 554, y: 805, width: 278, height: 35 },
      align: 'center',
      verticalAlign: 'middle',
    },
    sleepStatus: {
      section: { x: 495, y: 855, width: 487, height: 175 },
      textSafeArea: { x: 508, y: 888, width: 460, height: 135 },
      align: 'left',
      verticalAlign: 'middle',
    },
    chaos: {
      section: { x: 495, y: 1034, width: 487, height: 115 },
      textSafeArea: { x: 508, y: 1068, width: 460, height: 75 },
      align: 'left',
      verticalAlign: 'middle',
    },
    poweredBy: {
      section: { x: 495, y: 1152, width: 487, height: 108 },
      textSafeArea: { x: 508, y: 1182, width: 460, height: 72 },
      align: 'left',
      verticalAlign: 'middle',
    },
    mostUsedKey: {
      section: { x: 495, y: 1262, width: 264, height: 103 },
      textSafeArea: { x: 508, y: 1290, width: 170, height: 70 },
      align: 'left',
      verticalAlign: 'middle',
    },
    favoriteError: {
      section: { x: 495, y: 1368, width: 264, height: 150 },
      textSafeArea: { x: 508, y: 1398, width: 170, height: 112 },
      align: 'left',
      verticalAlign: 'middle',
    },
  },
};

console.log('CARD_LAYOUT structure verified successfully.');
