#!/bin/bash
echo "🚀 Starting VidyaQuest STEM Platform..."
cd "$(dirname "$0")"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi
echo "✅ Server starting at http://localhost:3000"
node backend/server.js
