#!/bin/bash

# ============================================================
#  Safura AI — Icon Export Script
#  Converts all SVGs to PNG at every required platform size
#  Requires: Inkscape (recommended) or rsvg-convert or cairosvg
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SVG_DIR="$SCRIPT_DIR/svg"
IOS_DIR="$SCRIPT_DIR/ios"
ANDROID_DIR="$SCRIPT_DIR/android"
WEB_DIR="$SCRIPT_DIR/web"

mkdir -p "$IOS_DIR" "$ANDROID_DIR" "$WEB_DIR"

# Detect converter
if command -v inkscape &>/dev/null; then
  CONVERTER="inkscape"
elif command -v rsvg-convert &>/dev/null; then
  CONVERTER="rsvg"
elif command -v cairosvg &>/dev/null; then
  CONVERTER="cairosvg"
else
  echo "ERROR: No SVG converter found."
  echo "Install one of:"
  echo "  macOS:  brew install inkscape   OR  brew install librsvg"
  echo "  Ubuntu: sudo apt install inkscape  OR  sudo apt install librsvg2-bin"
  echo "  pip:    pip install cairosvg"
  exit 1
fi

convert_svg() {
  local src="$1"
  local dest="$2"
  local size="$3"

  if [ "$CONVERTER" = "inkscape" ]; then
    inkscape "$src" --export-filename="$dest" --export-width="$size" --export-height="$size" 2>/dev/null
  elif [ "$CONVERTER" = "rsvg" ]; then
    rsvg-convert "$src" -w "$size" -h "$size" -o "$dest"
  elif [ "$CONVERTER" = "cairosvg" ]; then
    cairosvg "$src" -W "$size" -H "$size" -o "$dest"
  fi
}

PRIMARY="$SVG_DIR/safura-icon-primary.svg"
LIGHT="$SVG_DIR/safura-icon-light.svg"
MONO="$SVG_DIR/safura-icon-mono.svg"
CIRCLE="$SVG_DIR/safura-icon-circle.svg"
WORDMARK="$SVG_DIR/safura-wordmark.svg"
FAVICON_SVG="$WEB_DIR/favicon.svg"

echo ""
echo "================================================"
echo "  Safura AI — Exporting icons"
echo "  Using: $CONVERTER"
echo "================================================"
echo ""

# ── iOS AppIcon sizes ────────────────────────────────────────
echo "[1/5] Generating iOS icons..."

declare -a IOS_SIZES=(20 29 40 58 60 76 80 87 120 152 167 180 1024)

for s in "${IOS_SIZES[@]}"; do
  convert_svg "$PRIMARY" "$IOS_DIR/AppIcon-${s}x${s}.png" "$s"
  echo "  ✓ AppIcon-${s}x${s}.png"
done

# ── Android launcher icons ───────────────────────────────────
echo ""
echo "[2/5] Generating Android icons..."

declare -A ANDROID_SIZES=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
  ["playstore"]=512
)

for density in "${!ANDROID_SIZES[@]}"; do
  s="${ANDROID_SIZES[$density]}"
  dest="$ANDROID_DIR/ic_launcher_${density}.png"
  convert_svg "$PRIMARY" "$dest" "$s"
  echo "  ✓ ic_launcher_${density}.png (${s}px)"
done

convert_svg "$LIGHT" "$ANDROID_DIR/ic_launcher_round_192.png" 192
echo "  ✓ ic_launcher_round_192.png"

# ── Web / PWA icons ──────────────────────────────────────────
echo ""
echo "[3/5] Generating web & PWA icons..."

declare -a WEB_SIZES=(16 32 48 64 96 128 192 256 384 512)

for s in "${WEB_SIZES[@]}"; do
  convert_svg "$FAVICON_SVG" "$WEB_DIR/favicon-${s}x${s}.png" "$s"
  echo "  ✓ favicon-${s}x${s}.png"
done

convert_svg "$PRIMARY" "$WEB_DIR/apple-touch-icon.png" 180
echo "  ✓ apple-touch-icon.png (180px)"

convert_svg "$PRIMARY" "$WEB_DIR/og-icon.png" 512
echo "  ✓ og-icon.png (512px)"

# ── Monochrome & circle variants ────────────────────────────
echo ""
echo "[4/5] Generating brand variants..."

declare -a BRAND_SIZES=(64 128 256 512 1024)

for s in "${BRAND_SIZES[@]}"; do
  convert_svg "$MONO"    "$SVG_DIR/../brand/safura-mono-${s}.png"    "$s"
  convert_svg "$CIRCLE"  "$SVG_DIR/../brand/safura-circle-${s}.png"  "$s"
  convert_svg "$PRIMARY" "$SVG_DIR/../brand/safura-primary-${s}.png" "$s"
  echo "  ✓ All variants at ${s}px"
done

# ── Wordmark PNG ─────────────────────────────────────────────
echo ""
echo "[5/5] Generating wordmark..."
mkdir -p "$SCRIPT_DIR/brand"

if [ "$CONVERTER" = "inkscape" ]; then
  inkscape "$WORDMARK" --export-filename="$SCRIPT_DIR/brand/safura-wordmark.png" --export-width=960 --export-height=240 2>/dev/null
elif [ "$CONVERTER" = "rsvg" ]; then
  rsvg-convert "$WORDMARK" -w 960 -h 240 -o "$SCRIPT_DIR/brand/safura-wordmark.png"
elif [ "$CONVERTER" = "cairosvg" ]; then
  cairosvg "$WORDMARK" -W 960 -H 240 -o "$SCRIPT_DIR/brand/safura-wordmark.png"
fi
echo "  ✓ safura-wordmark.png (960×240)"

echo ""
echo "================================================"
echo "  Done! All icons exported."
echo "================================================"
echo ""
echo "Output folders:"
echo "  iOS:      $IOS_DIR"
echo "  Android:  $ANDROID_DIR"
echo "  Web:      $WEB_DIR"
echo "  Brand:    $SCRIPT_DIR/brand"
echo ""
