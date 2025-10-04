#!/bin/bash

# University Data Upload Script Runner
# This is a helper script to run the university data upload

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         KUBIX - University Data Upload Script             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if backend server is running
echo "🔍 Checking if backend server is running..."
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is NOT running on port 5001"
    echo ""
    echo "Please start your backend server first:"
    echo "  npm run dev"
    echo "  or"
    echo "  yarn dev"
    echo ""
    exit 1
fi

echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "   1. Ensure your MongoDB is connected"
echo "   2. Verify your admin token is valid"
echo "   3. Check the API_URL in data.js (localhost vs production)"
echo ""

read -p "Do you want to proceed with the upload? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting university data upload..."
    echo ""
    
    # Run with node (use bun if available for better performance)
    if command -v bun &> /dev/null; then
        echo "Using Bun for faster execution..."
        bun data.js
    else
        echo "Using Node.js..."
        node data.js
    fi
    
    echo ""
    echo "✨ Upload script completed!"
else
    echo ""
    echo "❌ Upload cancelled"
    exit 0
fi

