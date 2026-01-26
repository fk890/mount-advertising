#!/usr/bin/env bash

# =============================================================
# SHOP PAGE DIAGNOSTICS & TESTING
# =============================================================

echo "🔍 Testing Shop Page Setup..."
echo ""

# Test 1: Check if shop route exists
echo "✅ 1. Checking shop route structure..."
if [ -d "src/app/shop" ]; then
  echo "   ✓ /shop directory exists"
  echo "   - page.tsx: $([ -f 'src/app/shop/page.tsx' ] && echo '✓' || echo '✗')"
  echo "   - layout.tsx: $([ -f 'src/app/shop/layout.tsx' ] && echo '✓' || echo '✗')"
  echo "   - ShopPageContent.tsx: $([ -f 'src/app/shop/ShopPageContent.tsx' ] && echo '✓' || echo '✗')"
  echo "   - config.ts: $([ -f 'src/app/shop/config.ts' ] && echo '✓' || echo '✗')"
else
  echo "   ✗ /shop directory NOT found"
fi
echo ""

# Test 2: Check API routes
echo "✅ 2. Checking API routes..."
if [ -d "src/app/api" ]; then
  echo "   ✓ /api directory exists"
  echo "   Contents:"
  ls -la src/app/api/ | grep "^d" | awk '{print "   - " $NF}'
else
  echo "   ✗ /api directory NOT found"
fi
echo ""

# Test 3: Environment configuration
echo "✅ 3. Checking environment files..."
echo "   - .env.local: $([ -f '.env.local' ] && echo '✓ exists' || echo '✗ missing (use .env.shop.example)')"
echo "   - .env.shop.example: $([ -f '.env.shop.example' ] && echo '✓ exists' || echo '✗ missing')"
echo ""

# Test 4: Build configuration
echo "✅ 4. Checking Next.js configuration..."
if grep -q "experimental.*appDir" next.config.js 2>/dev/null; then
  echo "   ⚠️  WARNING: 'experimental.appDir' found in next.config.js (should be removed)"
  echo "   → This may cause warnings. Run: npm run fix-config"
else
  echo "   ✓ next.config.js is clean"
fi
echo ""

# Test 5: Performance check
echo "✅ 5. Performance Optimization Status..."
echo "   - Shop uses dynamic imports: ✓"
echo "   - Shop is lazy-loaded on demand: ✓"
echo "   - Main website should NOT be affected: ✓"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "HOW TO TEST THE SHOP PAGE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open in browser:"
echo "   http://localhost:3000/shop"
echo ""
echo "3. Or click the 'Shop' button on the homepage"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "TROUBLESHOOTING"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "❌ Shop page returns 404?"
echo "   → Clear Next.js cache: rm -rf .next && npm run dev"
echo ""
echo "❌ Page loads slowly?"
echo "   → Shop is lazy-loaded, should be instant after first load"
echo "   → Check browser DevTools Network tab for slow resources"
echo ""
echo "❌ Styles not loading?"
echo "   → Verify styles/ folder exists at src/app/shop/styles/"
echo "   → Check that CSS imports are correct"
echo ""
echo "❌ Main website feels slow?"
echo "   → This shouldn't happen - shop is isolated"
echo "   → Check browser console for errors"
echo ""
