#!/usr/bin/env bash
# Build upload-ready copies of the site for FTP / Apache hosting.
#   ./build.sh  ->
#     ../dist/onework-website/      the site on its own (works at any web root or subfolder)
#     ../dist/onework-web-upload/   onework.io server layout, mirrors public_html/:
#         .htaccess        (deploy/root.htaccess: passes requests into onework-web/, old-URL redirects)
#         onework-web/     (the site)
# For onework.io: upload the CONTENTS of dist/onework-web-upload/ into public_html/
# (show hidden files so both .htaccess files go up).
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DIST="$SRC/../dist"
OUT="$DIST/onework-website"
UP="$DIST/onework-web-upload"

# Chinese pages (zh/) are generated from the English ones: refresh them first.
python3 "$SRC/tools/build_zh.py" "$SRC"

rm -rf "$OUT" "$UP"
mkdir -p "$OUT" "$UP"

# Copy the site, leaving out repo-only and dev files.
tar -C "$SRC" \
  --exclude='./build.sh' --exclude='./tools' --exclude='./README.md' --exclude='./deploy' \
  --exclude='./.gitignore' --exclude='./.nojekyll' --exclude='*.gitkeep' \
  --exclude='*.DS_Store' --exclude='*Thumbs.db' --exclude='*.log' \
  --exclude='./.vscode' --exclude='./.idea' --exclude='./.claude' \
  --exclude='./node_modules' --exclude='./package.json' \
  --exclude='./package-lock.json' --exclude='./yarn.lock' \
  -cf - . | tar -C "$OUT" -xf -

# onework.io layout: the site inside onework-web/, plus the root .htaccess.
cp -r "$OUT" "$UP/onework-web"
cp "$SRC/deploy/root.htaccess" "$UP/.htaccess"
# Add the "opened directly as /onework-web/..." redirect right after RewriteEngine On.
awk -v rules="$SRC/deploy/subfolder-rules.htaccess" '
  { print }
  /^  RewriteEngine On$/ && !done { print ""; while ((getline line < rules) > 0) print line; done = 1 }
' "$OUT/.htaccess" > "$UP/onework-web/.htaccess"

echo "Built:  $OUT"
echo "Upload: $UP"
echo "Files:  $(find "$UP" -type f | wc -l)"
