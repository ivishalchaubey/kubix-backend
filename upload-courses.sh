#!/bin/bash

# ============================================
# Course Upload Script for macOS/Linux
# ============================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Course Bulk Upload - Kubix Backend              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if all-cources-data.json exists
if [ ! -f "all-cources-data.json" ]; then
    echo "❌ Error: all-cources-data.json file not found!"
    echo "Please ensure the file exists in the current directory."
    exit 1
fi

echo "✅ Found all-cources-data.json"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if server is running
echo "🔍 Checking if server is running on port 5001..."
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running"
else
    echo "⚠️  Warning: Server doesn't appear to be running on port 5001"
    echo "Please start your server with: npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Starting course upload process..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the upload script
node upload-courses.js

# Capture exit code
EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Upload completed successfully!"
else
    echo "❌ Upload encountered errors (Exit code: $EXIT_CODE)"
fi

echo ""
echo "Script finished at: $(date)"
echo ""

exit $EXIT_CODE


