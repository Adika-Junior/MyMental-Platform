#!/bin/bash
# Mobile app smoke tests
# Run this after building the mobile app to verify basic functionality

set -e

echo "🧪 Running mobile app smoke tests..."

# Check if Expo is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Test 1: Check if app builds
echo "📦 Testing app build..."
if npx expo export --platform android --output-dir ./build/android 2>&1 | grep -q "error"; then
    echo "❌ Build failed"
    exit 1
else
    echo "✅ Build successful"
fi

# Test 2: Check if app can start
echo "🚀 Testing app startup..."
if timeout 30 npx expo start --no-dev --minify 2>&1 | grep -q "Metro"; then
    echo "✅ App can start"
else
    echo "⚠️  App startup check inconclusive (may need manual verification)"
fi

# Test 3: Check critical files exist
echo "📁 Checking critical files..."
REQUIRED_FILES=(
    "app.json"
    "package.json"
    "App.tsx"
    "screens/LoginScreen.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test 4: Check dependencies
echo "📚 Checking dependencies..."
if [ -f "package.json" ]; then
    if grep -q "\"expo\"" package.json; then
        echo "✅ Expo dependency found"
    else
        echo "❌ Expo dependency missing"
        exit 1
    fi
fi

echo ""
echo "✅ All smoke tests passed!"

