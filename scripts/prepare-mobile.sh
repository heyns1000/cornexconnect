#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BOLD}CornexConnect — Mobile Build Pipeline${NC}\n"

# 1. Build the web app
echo -e "${CYAN}[1/4]${NC} Building web app..."
npm run build
echo -e "${GREEN}  ✓ Web build complete${NC}\n"

# 2. Ensure native platforms exist
if [ ! -d "android" ]; then
  echo -e "${CYAN}[2/4]${NC} Adding Android platform..."
  npx cap add android
  echo -e "${GREEN}  ✓ Android project created${NC}"
else
  echo -e "${CYAN}[2/4]${NC} Android platform already exists"
fi

if [ ! -d "ios" ]; then
  echo -e "${CYAN}[3/4]${NC} Adding iOS platform..."
  npx cap add ios
  echo -e "${GREEN}  ✓ iOS project created${NC}"
else
  echo -e "${CYAN}[3/4]${NC} iOS platform already exists"
fi

# 3. Sync web assets into native projects
echo -e "\n${CYAN}[4/4]${NC} Syncing web assets to native projects..."
npx cap sync
echo -e "${GREEN}  ✓ Sync complete${NC}\n"

# 4. Next steps
echo -e "${BOLD}━━━ Next Steps ━━━${NC}"
echo ""
echo -e "${BOLD}Android (Google Play):${NC}"
echo "  npx cap open android"
echo "  → Android Studio opens"
echo "  → Build > Generate Signed Bundle / APK"
echo "  → Choose Android App Bundle (.aab)"
echo "  → Upload .aab to Google Play Console"
echo ""
echo -e "${BOLD}iOS (App Store):${NC}"
echo "  npx cap open ios        (Mac required)"
echo "  → Xcode opens"
echo "  → Set Team in Signing & Capabilities"
echo "  → Product > Archive"
echo "  → Distribute App > App Store Connect"
echo ""
echo -e "${BOLD}OAuth Deep Links:${NC}"
echo "  Ensure your OAuth providers have these redirect URIs:"
echo "    com.cornexconnect.app://oauth/callback/google"
echo "    com.cornexconnect.app://oauth/callback/microsoft"
echo "    com.cornexconnect.app://oauth/callback/github"
echo "    com.cornexconnect.app://oauth/callback/facebook"
echo ""
echo -e "${GREEN}Ready to build!${NC}"
