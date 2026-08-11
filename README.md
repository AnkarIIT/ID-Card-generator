# HH Goa 2026 - Frame / Builder ID Generator

A polished, branded microsite for generating builder identity graphics for HH Goa 2026.

## Features

- **Photo Upload**: JPG, PNG, HEIC support
- **ID Card Generation**: Canvas-based rendering
- **Live Preview**: Real-time card updates as you type
- **Auto Title Generation**: AI/ML role detection with themed titles
- **Mobile First**: Responsive design optimized for phones
- **X (Twitter) Sharing**: Pre-filled caption with #FrameInGoa
- **Download**: PNG export of generated cards

## Project Structure

```
hhgoa-frame/
├── index.html          # Main page
├── css/
│   ├── variables.css   # Design tokens
│   ├── reset.css       # CSS reset
│   ├── base.css        # Base styles
│   ├── components.css  # UI components
│   ├── animations.css  # CSS animations
│   └── responsive.css  # Media queries
├── js/
│   └── app.js          # Main application
└── README.md
```

## Architecture

- Vanilla HTML/CSS/JavaScript
- Single-page application
- Centralized state management
- Canvas-based image rendering
- No framework dependencies
- No backend required

## Usage

1. Open `index.html` in a modern browser
2. Upload a photo (JPG, PNG, or HEIC)
3. Choose ID Card format
4. Enter your name and role
5. Click "CREATE MY ID"
6. Download or share to X

## Development

Simply open `index.html` in a browser or serve with any static file server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Design

- Dark theme with accent color
- HH Goa 2026 branding
- Premium, event-specific aesthetic
- Clean typography with strong contrast
- Mobile-optimized touch targets

## Browser Support

- Chrome 80+
- Firefox 74+
- Safari 13+
- Edge 80+

HEIC support requires browser-native HEIC decoding (iOS Safari, some Android browsers).