#!/bin/bash

echo "================================"
echo "   YT ChatBot Extension Setup"
echo "================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo "[1/4] Installing Python dependencies..."
pip3 install -r backend_requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi

echo "[2/4] Checking environment setup..."
if [ ! -f .env ]; then
    echo "WARNING: No .env file found"
    echo "Please create a .env file with your GOOGLE_API_KEY"
    echo "Example: GOOGLE_API_KEY=your_api_key_here"
    echo
fi

echo "[3/4] Starting backend server..."
echo "Backend API will start at http://localhost:8000"
echo
echo "[4/4] Next steps:"
echo "1. Load the extension in Chrome:"
echo "   - Go to chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked' and select this folder"
echo
echo "2. Navigate to any YouTube video"
echo "3. Click the extension icon to start chatting!"
echo

echo "Starting server in 3 seconds..."
sleep 3

echo "================================"
echo "   Backend Server Starting..."
echo "================================"
python3 backend_api.py