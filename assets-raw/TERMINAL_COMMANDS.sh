# Safura AI — Icon Setup Guide
# Run every command below in your terminal exactly as shown.

# ════════════════════════════════════════════════════════════
#  STEP 1 — CREATE THE PROJECT FOLDER
# ════════════════════════════════════════════════════════════

mkdir -p ~/safura-icons/svg
mkdir -p ~/safura-icons/ios
mkdir -p ~/safura-icons/android
mkdir -p ~/safura-icons/web
mkdir -p ~/safura-icons/brand
cd ~/safura-icons

echo "Folders ready."


# ════════════════════════════════════════════════════════════
#  STEP 2 — SAVE ALL SVG FILES
#  Run each block below to create every SVG icon file.
# ════════════════════════════════════════════════════════════

# ── Primary Icon (dark bg, full detail) ─────────────────────
cat > ~/safura-icons/svg/safura-icon-primary.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><clipPath id="rounded"><rect width="1024" height="1024" rx="225"/></clipPath></defs>
  <rect width="1024" height="1024" rx="225" fill="#085041"/>
  <g clip-path="url(#rounded)">
    <circle cx="512" cy="554" r="460" fill="#0F6E56"/>
    <circle cx="512" cy="450" r="368" fill="#085041"/>
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="#1D9E75" stroke-width="36"/>
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="#5DCAA5" stroke-width="13"/>
    <line x1="512" y1="236" x2="512" y2="768" stroke="#5DCAA5" stroke-width="13"/>
    <line x1="318" y1="502" x2="706" y2="502" stroke="#5DCAA5" stroke-width="13"/>
    <circle cx="512" cy="502" r="36" fill="#5DCAA5"/>
    <circle cx="512" cy="502" r="18" fill="#085041"/>
    <path d="M512 369 Q574 328 624 276 Q604 358 552 410 Q594 388 656 388 Q604 432 542 432 Q530 462 512 502 Q494 462 482 432 Q420 432 368 388 Q430 388 472 410 Q420 358 400 276 Q450 328 512 369Z" fill="#EF9F27"/>
    <ellipse cx="512" cy="636" rx="61" ry="30" fill="#1D9E75" opacity="0.55"/>
    <line x1="512" y1="636" x2="512" y2="757" stroke="#1D9E75" stroke-width="20" stroke-linecap="round"/>
    <line x1="449" y1="688" x2="512" y2="665" stroke="#1D9E75" stroke-width="14" stroke-linecap="round"/>
    <line x1="575" y1="710" x2="512" y2="687" stroke="#1D9E75" stroke-width="14" stroke-linecap="round"/>
  </g>
  <text x="512" y="962" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" font-size="56" font-weight="700" fill="#5DCAA5" letter-spacing="18">SAFURA</text>
</svg>
SVGEOF

echo "✓ safura-icon-primary.svg"

# ── Light / Notification variant ────────────────────────────
cat > ~/safura-icons/svg/safura-icon-light.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><clipPath id="rounded"><rect width="1024" height="1024" rx="225"/></clipPath></defs>
  <rect width="1024" height="1024" rx="225" fill="#1D9E75"/>
  <g clip-path="url(#rounded)">
    <circle cx="512" cy="554" r="460" fill="#178f68"/>
    <circle cx="512" cy="450" r="368" fill="#1D9E75"/>
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="36"/>
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="13"/>
    <line x1="512" y1="236" x2="512" y2="768" stroke="rgba(255,255,255,0.95)" stroke-width="13"/>
    <line x1="318" y1="502" x2="706" y2="502" stroke="rgba(255,255,255,0.95)" stroke-width="13"/>
    <circle cx="512" cy="502" r="36" fill="rgba(255,255,255,0.98)"/>
    <circle cx="512" cy="502" r="18" fill="#1D9E75"/>
    <path d="M512 369 Q574 328 624 276 Q604 358 552 410 Q594 388 656 388 Q604 432 542 432 Q530 462 512 502 Q494 462 482 432 Q420 432 368 388 Q430 388 472 410 Q420 358 400 276 Q450 328 512 369Z" fill="rgba(255,255,255,0.98)"/>
    <ellipse cx="512" cy="636" rx="61" ry="30" fill="rgba(255,255,255,0.4)"/>
    <line x1="512" y1="636" x2="512" y2="757" stroke="rgba(255,255,255,0.7)" stroke-width="20" stroke-linecap="round"/>
    <line x1="449" y1="688" x2="512" y2="665" stroke="rgba(255,255,255,0.7)" stroke-width="14" stroke-linecap="round"/>
    <line x1="575" y1="710" x2="512" y2="687" stroke="rgba(255,255,255,0.7)" stroke-width="14" stroke-linecap="round"/>
  </g>
</svg>
SVGEOF

echo "✓ safura-icon-light.svg"

# ── Monochrome (system tray / docs) ─────────────────────────
cat > ~/safura-icons/svg/safura-icon-mono.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><clipPath id="rounded"><rect width="1024" height="1024" rx="225"/></clipPath></defs>
  <rect width="1024" height="1024" rx="225" fill="#F8FAF9"/>
  <g clip-path="url(#rounded)">
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="#085041" stroke-width="36" opacity="0.12"/>
    <ellipse cx="512" cy="502" rx="194" ry="266" fill="none" stroke="#085041" stroke-width="13"/>
    <line x1="512" y1="236" x2="512" y2="768" stroke="#085041" stroke-width="13"/>
    <line x1="318" y1="502" x2="706" y2="502" stroke="#085041" stroke-width="13"/>
    <circle cx="512" cy="502" r="36" fill="#085041"/>
    <circle cx="512" cy="502" r="18" fill="#F8FAF9"/>
    <path d="M512 369 Q574 328 624 276 Q604 358 552 410 Q594 388 656 388 Q604 432 542 432 Q530 462 512 502 Q494 462 482 432 Q420 432 368 388 Q430 388 472 410 Q420 358 400 276 Q450 328 512 369Z" fill="#EF9F27"/>
    <ellipse cx="512" cy="636" rx="61" ry="30" fill="#085041" opacity="0.25"/>
    <line x1="512" y1="636" x2="512" y2="757" stroke="#085041" stroke-width="20" stroke-linecap="round"/>
    <line x1="449" y1="688" x2="512" y2="665" stroke="#085041" stroke-width="14" stroke-linecap="round"/>
    <line x1="575" y1="710" x2="512" y2="687" stroke="#085041" stroke-width="14" stroke-linecap="round"/>
  </g>
</svg>
SVGEOF

echo "✓ safura-icon-mono.svg"

# ── Circle / Social variant ──────────────────────────────────
cat > ~/safura-icons/svg/safura-icon-circle.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><clipPath id="circle-clip"><circle cx="512" cy="512" r="512"/></clipPath></defs>
  <circle cx="512" cy="512" r="512" fill="#E1F5EE"/>
  <g clip-path="url(#circle-clip)">
    <ellipse cx="512" cy="502" rx="204" ry="280" fill="none" stroke="#085041" stroke-width="36" opacity="0.1"/>
    <ellipse cx="512" cy="502" rx="204" ry="280" fill="none" stroke="#085041" stroke-width="14"/>
    <line x1="512" y1="222" x2="512" y2="782" stroke="#085041" stroke-width="14"/>
    <line x1="308" y1="502" x2="716" y2="502" stroke="#085041" stroke-width="14"/>
    <circle cx="512" cy="502" r="40" fill="#085041"/>
    <circle cx="512" cy="502" r="20" fill="#E1F5EE"/>
    <path d="M512 369 Q574 328 624 276 Q604 358 552 410 Q594 388 656 388 Q604 432 542 432 Q530 462 512 502 Q494 462 482 432 Q420 432 368 388 Q430 388 472 410 Q420 358 400 276 Q450 328 512 369Z" fill="#EF9F27"/>
    <ellipse cx="512" cy="646" rx="70" ry="34" fill="#085041" opacity="0.2"/>
    <line x1="512" y1="646" x2="512" y2="782" stroke="#085041" stroke-width="22" stroke-linecap="round"/>
    <line x1="442" y1="704" x2="512" y2="678" stroke="#085041" stroke-width="16" stroke-linecap="round"/>
    <line x1="582" y1="728" x2="512" y2="702" stroke="#085041" stroke-width="16" stroke-linecap="round"/>
  </g>
</svg>
SVGEOF

echo "✓ safura-icon-circle.svg"

# ── Wordmark (horizontal logo + tagline) ────────────────────
cat > ~/safura-icons/svg/safura-wordmark.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="120" height="120" rx="26" fill="#085041"/>
  <ellipse cx="60" cy="58" rx="23" ry="31" fill="none" stroke="#1D9E75" stroke-width="8.5"/>
  <ellipse cx="60" cy="58" rx="23" ry="31" fill="none" stroke="#5DCAA5" stroke-width="3"/>
  <line x1="60" y1="27" x2="60" y2="89" stroke="#5DCAA5" stroke-width="3"/>
  <line x1="37" y1="58" x2="83" y2="58" stroke="#5DCAA5" stroke-width="3"/>
  <circle cx="60" cy="58" r="8.5" fill="#5DCAA5"/>
  <circle cx="60" cy="58" r="4.2" fill="#085041"/>
  <path d="M60 43 Q67.5 38.5 73 33 Q71 41 65.5 46 Q70 44 76 44 Q70.5 49 63.5 49 Q62.5 53 60 58 Q57.5 53 56.5 49 Q49.5 49 44 44 Q50 44 54.5 46 Q49 41 47 33 Q52.5 38.5 60 43Z" fill="#EF9F27"/>
  <ellipse cx="60" cy="74" rx="9" ry="4.5" fill="#1D9E75" opacity="0.5"/>
  <line x1="60" y1="74" x2="60" y2="90" stroke="#1D9E75" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="51" y1="82" x2="60" y2="78" stroke="#1D9E75" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="69" y1="86" x2="60" y2="82" stroke="#1D9E75" stroke-width="2.5" stroke-linecap="round"/>
  <text x="148" y="58" font-family="'Helvetica Neue',Arial,sans-serif" font-size="48" font-weight="700" fill="#085041" letter-spacing="-1">safura</text>
  <text x="148" y="84" font-family="'Helvetica Neue',Arial,sans-serif" font-size="16" font-weight="400" fill="#1D9E75" letter-spacing="4">FOOD INTELLIGENCE</text>
</svg>
SVGEOF

echo "✓ safura-wordmark.svg"

# ── Favicon (32x32) ─────────────────────────────────────────
cat > ~/safura-icons/web/favicon.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#085041"/>
  <ellipse cx="16" cy="15.5" rx="5.8" ry="8" fill="none" stroke="#5DCAA5" stroke-width="1.5"/>
  <line x1="16" y1="7.5" x2="16" y2="23.5" stroke="#5DCAA5" stroke-width="1.2"/>
  <line x1="10.2" y1="15.5" x2="21.8" y2="15.5" stroke="#5DCAA5" stroke-width="1.2"/>
  <circle cx="16" cy="15.5" r="2.2" fill="#5DCAA5"/>
  <circle cx="16" cy="15.5" r="1.1" fill="#085041"/>
  <path d="M16 11.2 Q18.6 9.6 20.4 7.8 Q19.8 10.8 17.8 12.6 Q19.6 11.8 21.8 11.8 Q19.6 13.6 17 13.6 Q16.6 14.6 16 15.5 Q15.4 14.6 15 13.6 Q12.4 13.6 10.2 11.8 Q12.4 11.8 14.2 12.6 Q12.2 10.8 11.6 7.8 Q13.4 9.6 16 11.2Z" fill="#EF9F27"/>
</svg>
SVGEOF

echo "✓ favicon.svg"


# ════════════════════════════════════════════════════════════
#  STEP 3 — INSTALL AN SVG-TO-PNG CONVERTER
#  Pick the ONE that fits your system (run only one block).
# ════════════════════════════════════════════════════════════

# ── Option A: macOS with Homebrew (Inkscape) ─────────────────
brew install inkscape

# ── Option A: macOS with Homebrew (librsvg — lighter) ────────
brew install librsvg

# ── Option B: Ubuntu / Debian ────────────────────────────────
sudo apt update && sudo apt install -y inkscape

# ── Option B: Ubuntu / Debian (librsvg — lighter) ────────────
sudo apt update && sudo apt install -y librsvg2-bin

# ── Option C: Any OS with Python (cairosvg) ──────────────────
pip install cairosvg


# ════════════════════════════════════════════════════════════
#  STEP 4 — RUN THE EXPORT SCRIPT
# ════════════════════════════════════════════════════════════

cd ~/safura-icons
chmod +x export-icons.sh
./export-icons.sh


# ════════════════════════════════════════════════════════════
#  STEP 5 — VERIFY OUTPUT
# ════════════════════════════════════════════════════════════

echo "=== iOS icons ===" && ls -lh ~/safura-icons/ios/
echo "=== Android icons ===" && ls -lh ~/safura-icons/android/
echo "=== Web icons ===" && ls -lh ~/safura-icons/web/
echo "=== Brand icons ===" && ls -lh ~/safura-icons/brand/


# ════════════════════════════════════════════════════════════
#  STEP 6 — GENERATE favicon.ico (optional, for web)
#  Requires ImageMagick
# ════════════════════════════════════════════════════════════

# Install ImageMagick:
#   macOS:   brew install imagemagick
#   Ubuntu:  sudo apt install imagemagick

convert \
  ~/safura-icons/web/favicon-16x16.png \
  ~/safura-icons/web/favicon-32x32.png \
  ~/safura-icons/web/favicon-48x48.png \
  ~/safura-icons/web/favicon.ico

echo "✓ favicon.ico created"


# ════════════════════════════════════════════════════════════
#  FINAL FOLDER STRUCTURE
# ════════════════════════════════════════════════════════════
#
#  ~/safura-icons/
#  ├── svg/
#  │   ├── safura-icon-primary.svg    ← master source
#  │   ├── safura-icon-light.svg      ← green bg variant
#  │   ├── safura-icon-mono.svg       ← light bg / docs
#  │   ├── safura-icon-circle.svg     ← social / profile
#  │   └── safura-wordmark.svg        ← horizontal logo
#  ├── ios/
#  │   ├── AppIcon-20x20.png
#  │   ├── AppIcon-29x29.png
#  │   ├── AppIcon-40x40.png
#  │   ├── AppIcon-58x58.png
#  │   ├── AppIcon-60x60.png
#  │   ├── AppIcon-76x76.png
#  │   ├── AppIcon-80x80.png
#  │   ├── AppIcon-87x87.png
#  │   ├── AppIcon-120x120.png
#  │   ├── AppIcon-152x152.png
#  │   ├── AppIcon-167x167.png
#  │   ├── AppIcon-180x180.png
#  │   └── AppIcon-1024x1024.png
#  ├── android/
#  │   ├── ic_launcher_mdpi.png       (48px)
#  │   ├── ic_launcher_hdpi.png       (72px)
#  │   ├── ic_launcher_xhdpi.png      (96px)
#  │   ├── ic_launcher_xxhdpi.png     (144px)
#  │   ├── ic_launcher_xxxhdpi.png    (192px)
#  │   ├── ic_launcher_round_192.png  (adaptive round)
#  │   └── ic_launcher_playstore.png  (512px)
#  ├── web/
#  │   ├── favicon.svg
#  │   ├── favicon-16x16.png
#  │   ├── favicon-32x32.png
#  │   ├── favicon-48x48.png
#  │   ├── favicon-64x64.png
#  │   ├── favicon-96x96.png
#  │   ├── favicon-128x128.png
#  │   ├── favicon-192x192.png
#  │   ├── favicon-256x256.png
#  │   ├── favicon-384x384.png
#  │   ├── favicon-512x512.png
#  │   ├── apple-touch-icon.png       (180px)
#  │   ├── og-icon.png                (512px)
#  │   └── favicon.ico                (multi-size)
#  └── brand/
#      ├── safura-primary-64.png
#      ├── safura-primary-128.png
#      ├── safura-primary-256.png
#      ├── safura-primary-512.png
#      ├── safura-primary-1024.png
#      ├── safura-mono-*.png
#      ├── safura-circle-*.png
#      └── safura-wordmark.png        (960×240)
