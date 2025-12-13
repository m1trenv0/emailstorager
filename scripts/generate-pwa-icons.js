// Simple script to generate PWA icons using Canvas API
// This creates basic PNG icons for PWA support

const fs = require('fs');
const path = require('path');

// SVG to base64 data URL for 192x192
const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="48" fill="#0070f3"/>
  <g fill="white">
    <rect x="48" y="64" width="96" height="12" rx="4"/>
    <rect x="48" y="88" width="96" height="12" rx="4"/>
    <rect x="48" y="112" width="64" height="12" rx="4"/>
    <circle cx="72" cy="144" r="6"/>
    <circle cx="120" cy="144" r="6"/>
  </g>
</svg>`;

// SVG to base64 data URL for 512x512
const svg512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0070f3"/>
  <g fill="white">
    <rect x="128" y="170" width="256" height="32" rx="8"/>
    <rect x="128" y="234" width="256" height="32" rx="8"/>
    <rect x="128" y="298" width="170" height="32" rx="8"/>
    <circle cx="192" cy="384" r="16"/>
    <circle cx="320" cy="384" r="16"/>
  </g>
</svg>`;

// SVG for maskable icon (with safe zone padding)
const svgMaskable = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#0070f3"/>
  <g fill="white">
    <rect x="58" y="74" width="76" height="10" rx="3"/>
    <rect x="58" y="94" width="76" height="10" rx="3"/>
    <rect x="58" y="114" width="50" height="10" rx="3"/>
    <circle cx="78" cy="138" r="5"/>
    <circle cx="114" cy="138" r="5"/>
  </g>
</svg>`;

console.log('Generating PWA icons...');
console.log('Note: For production, use proper image generation tools like sharp or imagemagick');
console.log('These are placeholder SVG files renamed to .png for basic PWA support\n');

const publicDir = path.join(__dirname, '..', 'public');

// Write SVG files (browsers will render them even with .png extension for basic testing)
// For production, you should use proper PNG conversion
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), svg192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), svg512);
fs.writeFileSync(path.join(publicDir, 'icon-192x192-maskable.png'), svgMaskable);

console.log('✓ Created icon-192x192.png');
console.log('✓ Created icon-512x512.png');
console.log('✓ Created icon-192x192-maskable.png');
console.log('\nWARNING: These are SVG files for testing. For production:');
console.log('1. Install: npm install sharp');
console.log('2. Use proper image conversion or online tools like https://realfavicongenerator.net/');

