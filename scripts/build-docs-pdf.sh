#!/bin/bash
# 生成运营/业务用的 PDF（中文 + 截图，无页眉页脚）。
# 依赖：pandoc + Google Chrome（macOS）。
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CSS="$ROOT/scripts/docs-pdf.css"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$ROOT/docs/pdf"

build() {
  local md="$1"
  local out="$2"
  local html
  html="$(mktemp -t aijobfit-pdf).html"
  ( cd "$ROOT/docs" && pandoc "$(basename "$md")" \
      --standalone --metadata title="" \
      --css "$CSS" --embed-resources -o "$html" )
  "$CHROME" --headless --disable-gpu --no-sandbox \
    --no-pdf-header-footer \
    --print-to-pdf="$out" "file://$html" 2>/dev/null
  rm "$html"
  printf "  → %s (%s)\n" "$out" "$(du -h "$out" | cut -f1)"
}

build "$ROOT/docs/用户流程-图文版.md"  "$ROOT/docs/pdf/用户流程-图文版.pdf"
build "$ROOT/docs/产品手册-运营版.md"  "$ROOT/docs/pdf/产品手册-运营版.pdf"
