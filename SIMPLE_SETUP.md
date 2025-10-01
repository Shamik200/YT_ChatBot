# 🚀 YT ChatBot Extension - Simple Setup

A beautiful YouTube extension that lets you chat with any video using AI! Uses the exact same chain from your Jupyter notebook.

## ⚡ Quick Start (3 Steps)

### Step 1: Install & Run Backend
```bash
# Install dependencies
pip install -r backend_requirements.txt

# Set your Google AI API key
set GOOGLE_API_KEY=your_google_ai_api_key_here

# Start server
python backend_api.py
```
Server runs at: `http://localhost:8000`

### Step 2: Install Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" → Select this folder
4. Done! Extension appears in toolbar

### Step 3: Use It!
1. Go to any YouTube video
2. Click the extension icon 🤖
3. Wait for "Connected to video" 
4. Start chatting!

## 🎯 Features
- **Beautiful UI** with sliders for AI creativity & context
- **Exact same chain** from your Jupyter notebook
- **Real-time connection** to YouTube videos
- **Export chats** as JSON files

## 🛠️ How It Works
- Uses your exact RecursiveCharacterTextSplitter → FAISS → Gemini chain
- Simple FastAPI backend (only 80 lines!)
- Modern extension UI with gradients & animations

## 🔧 Customization
Use the sliders in the extension:
- **AI Creativity**: 0.0 (conservative) to 1.0 (creative)
- **Context Amount**: 2-8 chunks of video context

## 🚨 Troubleshooting
- **"Not connected"**: Make sure you're on `youtube.com/watch?v=...`
- **"Backend error"**: Check if `python backend_api.py` is running
- **"No captions"**: Try a different video with subtitles

That's it! Super simple setup with beautiful UI and your exact notebook functionality! 🎉