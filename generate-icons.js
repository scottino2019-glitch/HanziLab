import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgPath = path.resolve('./public/icon.svg');
const publicDir = path.resolve('./public');

// Maskable SVG with safe-zone margin (15% padding all around)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sealBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
  </defs>
  <!-- Full bleed background for Android maskable icon -->
  <rect width="512" height="512" fill="#7f1d1d" />
  <!-- Safe zone container (inside 80% circle) -->
  <circle cx="256" cy="256" r="185" fill="#f3ece2" />
  <circle cx="256" cy="256" r="160" fill="url(#sealBg)" stroke="#d97706" stroke-width="6" />
  <text x="256" y="325" font-family="'Noto Serif SC', 'Songti SC', 'SimSun', serif" font-size="200" font-weight="900" fill="#ffffff" text-anchor="middle">字</text>
  <text x="256" y="380" font-family="sans-serif" font-size="22" font-weight="700" fill="#fef3c7" text-anchor="middle" letter-spacing="4">HANZI</text>
</svg>
`;

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // apple-touch-icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // favicon.png (48x48) & favicon.ico
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');
}

generate().catch(console.error);
