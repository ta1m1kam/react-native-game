import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets', 'images');

// シェイクゲーム用アイコンSVG - 振動・波紋をモチーフにしたデザイン
const createMainIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="50%" style="stop-color:#764ba2"/>
      <stop offset="100%" style="stop-color:#f093fb"/>
    </linearGradient>
    <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e0e0e0"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90D9"/>
      <stop offset="100%" style="stop-color:#667eea"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="1024" height="1024" rx="224" fill="url(#bgGrad)"/>

  <!-- 振動の波紋（外側から内側へ） -->
  <circle cx="512" cy="512" r="420" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
  <circle cx="512" cy="512" r="340" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="10"/>
  <circle cx="512" cy="512" r="260" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="12"/>

  <!-- 動きの線（左側） -->
  <path d="M180 380 Q140 512 180 644" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="16" stroke-linecap="round"/>
  <path d="M240 320 Q190 512 240 704" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="12" stroke-linecap="round"/>

  <!-- 動きの線（右側） -->
  <path d="M844 380 Q884 512 844 644" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="16" stroke-linecap="round"/>
  <path d="M784 320 Q834 512 784 704" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="12" stroke-linecap="round"/>

  <!-- スマートフォン本体（少し傾けて動きを表現） -->
  <g transform="translate(512, 512) rotate(-8) translate(-512, -512)" filter="url(#shadow)">
    <!-- 本体 -->
    <rect x="362" y="220" width="300" height="584" rx="40" fill="url(#phoneGrad)"/>

    <!-- 画面 -->
    <rect x="382" y="280" width="260" height="464" rx="8" fill="url(#screenGrad)"/>

    <!-- 画面内のカウント表示 -->
    <text x="512" y="540" font-family="Arial Black, sans-serif" font-size="120" font-weight="900" fill="#fff" text-anchor="middle">42</text>

    <!-- 画面内のラベル -->
    <text x="512" y="620" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.8)" text-anchor="middle">SHAKES</text>

    <!-- ホームインジケーター -->
    <rect x="452" y="760" width="120" height="8" rx="4" fill="#ccc"/>
  </g>
</svg>
`;

// Android用フォアグラウンド（セーフゾーン対応、中央432pxに収める）
const createAndroidForegroundSVG = () => `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="phoneGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e8e8e8"/>
    </linearGradient>
    <linearGradient id="screenGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90D9"/>
      <stop offset="100%" style="stop-color:#667eea"/>
    </linearGradient>
    <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- 動きの線（左側） -->
  <path d="M320 400 Q280 512 320 624" fill="none" stroke="rgba(102,126,234,0.7)" stroke-width="20" stroke-linecap="round"/>
  <path d="M360 340 Q310 512 360 684" fill="none" stroke="rgba(102,126,234,0.5)" stroke-width="14" stroke-linecap="round"/>

  <!-- 動きの線（右側） -->
  <path d="M704 400 Q744 512 704 624" fill="none" stroke="rgba(102,126,234,0.7)" stroke-width="20" stroke-linecap="round"/>
  <path d="M664 340 Q714 512 664 684" fill="none" stroke="rgba(102,126,234,0.5)" stroke-width="14" stroke-linecap="round"/>

  <!-- スマートフォン（中央セーフゾーン432px内に収める） -->
  <g transform="translate(512, 512) rotate(-8) translate(-512, -512)" filter="url(#shadow2)">
    <rect x="402" y="296" width="220" height="432" rx="32" fill="url(#phoneGrad2)"/>
    <rect x="418" y="340" width="188" height="344" rx="6" fill="url(#screenGrad2)"/>
    <text x="512" y="530" font-family="Arial Black, sans-serif" font-size="80" font-weight="900" fill="#fff" text-anchor="middle">42</text>
    <text x="512" y="590" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.8)" text-anchor="middle">SHAKES</text>
    <rect x="472" y="696" width="80" height="6" rx="3" fill="#ccc"/>
  </g>
</svg>
`;

// Android用バックグラウンド（グラデーション背景）
const createAndroidBackgroundSVG = () => `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="50%" style="stop-color:#764ba2"/>
      <stop offset="100%" style="stop-color:#f093fb"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bgGrad3)"/>
  <!-- 振動の波紋 -->
  <circle cx="512" cy="512" r="450" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
  <circle cx="512" cy="512" r="380" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="8"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="10"/>
</svg>
`;

// Android用モノクロ
const createAndroidMonochromeSVG = () => `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- 動きの線（左側） -->
  <path d="M320 400 Q280 512 320 624" fill="none" stroke="#000" stroke-width="20" stroke-linecap="round"/>
  <path d="M360 340 Q310 512 360 684" fill="none" stroke="#000" stroke-width="14" stroke-linecap="round" opacity="0.6"/>

  <!-- 動きの線（右側） -->
  <path d="M704 400 Q744 512 704 624" fill="none" stroke="#000" stroke-width="20" stroke-linecap="round"/>
  <path d="M664 340 Q714 512 664 684" fill="none" stroke="#000" stroke-width="14" stroke-linecap="round" opacity="0.6"/>

  <!-- スマートフォン -->
  <g transform="translate(512, 512) rotate(-8) translate(-512, -512)">
    <rect x="402" y="296" width="220" height="432" rx="32" fill="none" stroke="#000" stroke-width="12"/>
    <rect x="418" y="340" width="188" height="344" rx="6" fill="#000"/>
    <text x="512" y="530" font-family="Arial Black, sans-serif" font-size="80" font-weight="900" fill="#fff" text-anchor="middle">42</text>
    <rect x="472" y="696" width="80" height="6" rx="3" fill="#000"/>
  </g>
</svg>
`;

// スプラッシュ用アイコン（シンプル版）
const createSplashIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>

  <!-- 動きの線 -->
  <path d="M100 200 Q70 256 100 312" fill="none" stroke="url(#splashGrad)" stroke-width="12" stroke-linecap="round"/>
  <path d="M412 200 Q442 256 412 312" fill="none" stroke="url(#splashGrad)" stroke-width="12" stroke-linecap="round"/>

  <!-- スマートフォン -->
  <g transform="translate(256, 256) rotate(-8) translate(-256, -256)">
    <rect x="181" y="98" width="150" height="316" rx="24" fill="url(#splashGrad)"/>
    <rect x="195" y="130" width="122" height="252" rx="4" fill="#fff"/>
    <text x="256" y="270" font-family="Arial Black, sans-serif" font-size="56" font-weight="900" fill="url(#splashGrad)" text-anchor="middle">42</text>
  </g>
</svg>
`;

async function generateIcon(svgContent, outputPath, width, height) {
  await sharp(Buffer.from(svgContent))
    .resize(width, height)
    .png()
    .toFile(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  console.log('Generating app icons...\n');

  // iOS用アイコン (1024x1024)
  await generateIcon(
    createMainIconSVG(1024),
    join(assetsDir, 'icon.png'),
    1024, 1024
  );

  // Android用フォアグラウンド (1024x1024)
  await generateIcon(
    createAndroidForegroundSVG(),
    join(assetsDir, 'android-icon-foreground.png'),
    1024, 1024
  );

  // Android用バックグラウンド (1024x1024)
  await generateIcon(
    createAndroidBackgroundSVG(),
    join(assetsDir, 'android-icon-background.png'),
    1024, 1024
  );

  // Android用モノクロ (1024x1024)
  await generateIcon(
    createAndroidMonochromeSVG(),
    join(assetsDir, 'android-icon-monochrome.png'),
    1024, 1024
  );

  // スプラッシュアイコン (512x512)
  await generateIcon(
    createSplashIconSVG(512),
    join(assetsDir, 'splash-icon.png'),
    512, 512
  );

  // Favicon (48x48)
  await generateIcon(
    createMainIconSVG(48),
    join(assetsDir, 'favicon.png'),
    48, 48
  );

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
