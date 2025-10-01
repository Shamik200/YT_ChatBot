@echo off
echo ================================
echo    YT ChatBot Extension Setup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo [1/4] Installing Python dependencies...
pip install -r backend_requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [2/4] Checking environment setup...
if not exist .env (
    echo WARNING: No .env file found
    echo Please create a .env file with your GOOGLE_API_KEY
    echo Example: GOOGLE_API_KEY=your_api_key_here
    echo.
)

echo [3/4] Starting backend server...
echo Backend API will start at http://localhost:8000
echo.
echo [4/4] Next steps:
echo 1. Load the extension in Chrome:
echo    - Go to chrome://extensions/
echo    - Enable Developer mode
echo    - Click 'Load unpacked' and select this folder
echo.
echo 2. Navigate to any YouTube video
echo 3. Click the extension icon to start chatting!
echo.
echo Starting server in 3 seconds...
timeout /t 3 /nobreak >nul

echo ================================
echo    Backend Server Starting...
echo ================================
python backend_api.py