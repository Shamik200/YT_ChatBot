# YT ChatBot - AI-Powered YouTube Video Assistant 🤖

A sophisticated browser extension that transforms YouTube videos into interactive conversations using AI. Chat with any YouTube video using transcript analysis and advanced language models.

## 🌟 Features

- **Smart Video Analysis**: Automatically processes YouTube video transcripts
- **AI-Powered Chat**: Ask questions about video content and get intelligent responses  
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Customizable Settings**: Adjust AI creativity and context amount with intuitive sliders
- **Real-time Connection**: Automatically detects YouTube videos and connects
- **Chat Export**: Save your conversations for later reference
- **Cross-Video Memory**: Maintains context across different videos

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
pip install -r backend_requirements.txt

# Install frontend dependencies (if using Node.js build tools)
npm install  # Optional: for development workflow
```

### 2. Setup Environment

Create a `.env` file in the project root:

```env
# Google AI API Key (required for Gemini)
GOOGLE_API_KEY=your_google_ai_api_key_here

# Optional: Custom settings
DEFAULT_TEMPERATURE=0.2
DEFAULT_CONTEXT_K=4
```

### 3. Start the Backend Server

```bash
# Start the FastAPI backend
python backend_api.py

# Or using uvicorn directly
uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 4. Install Browser Extension

#### For Chrome/Edge:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select this project folder
4. The extension icon will appear in your toolbar

#### For Firefox:
1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file

### 5. Create Extension Icons

Follow the instructions in `/icons/README.md` to create the required icon files:
- `icon16.png` (16x16)
- `icon32.png` (32x32) 
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 🎯 How to Use

1. **Navigate to YouTube**: Open any YouTube video in your browser
2. **Open Extension**: Click the YT ChatBot icon in your toolbar
3. **Wait for Connection**: The extension will automatically detect and process the video
4. **Start Chatting**: Type your questions about the video content
5. **Customize Settings**: Use the sliders to adjust AI behavior:
   - **AI Creativity**: Controls response creativity (0.0 = conservative, 1.0 = creative)
   - **Context Amount**: How much video context to use (2-8 chunks)

## 🛠️ Technical Architecture

### Backend (Python)
- **FastAPI**: High-performance web API framework
- **LangChain**: Advanced language model orchestration
- **FAISS**: Efficient vector similarity search
- **Google Gemini**: State-of-the-art language model
- **HuggingFace Transformers**: Open-source embeddings

### Frontend (JavaScript)
- **Chrome Extension API**: Browser integration
- **Modern CSS**: Responsive design with animations
- **WebRTC**: Real-time communication capabilities
- **Local Storage**: Settings and chat history persistence

### Key Components

```
├── backend_api.py          # FastAPI server with AI processing
├── manifest.json           # Extension configuration
├── popup.html              # Extension popup UI
├── popup.js               # Popup logic and API communication  
├── content.js             # YouTube page integration
├── background.js          # Extension background service
├── styles.css             # YouTube page styling
└── popup-styles.css       # Popup styling
```

## 🔧 API Endpoints

### GET `/api/transcript/{video_id}`
Fetch and process video transcript
```json
{
  "message": "Transcript fetched and processed successfully",
  "video_id": "abc123",
  "transcript_length": 15420
}
```

### POST `/api/chat`
Process questions about video content
```json
{
  "question": "What is the main topic?",
  "video_id": "abc123", 
  "temperature": 0.2,
  "contextK": 4
}
```

### GET `/api/video/{video_id}/status`
Check video processing status
```json
{
  "video_id": "abc123",
  "is_processed": true,
  "chunks_count": 42
}
```

## ⚙️ Configuration Options

### Extension Settings
- **Temperature**: AI response creativity (0.0-1.0)
- **Context K**: Number of relevant chunks to use (2-8)
- **Auto Connect**: Automatically connect to new videos
- **Chat History**: Enable/disable chat persistence

### Backend Configuration
- **Chunk Size**: Text splitting chunk size (default: 1000)
- **Chunk Overlap**: Overlap between chunks (default: 200)
- **Model**: Google Gemini model variant
- **Embedding Model**: HuggingFace model for embeddings

## 🧪 Development

### Running in Development Mode

```bash
# Start backend with auto-reload
uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000

# Watch for file changes (if using build tools)
npm run dev
```

### Testing

```bash
# Test the API endpoints
curl -X GET "http://localhost:8000/api/transcript/ubOo3NEA4rA"

# Test chat functionality  
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this video about?", "video_id": "ubOo3NEA4rA"}'
```

### Building for Production

```bash
# Install production dependencies only
pip install -r backend_requirements.txt --no-dev

# Optimize for production
export ENVIRONMENT=production
python backend_api.py
```

## 📱 Browser Compatibility

- ✅ **Chrome**: Full support (v88+)
- ✅ **Edge**: Full support (v88+)  
- ✅ **Firefox**: Full support (v89+)
- ⚠️ **Safari**: Limited support (requires manifest v2 conversion)

## 🔒 Privacy & Security

- **Local Processing**: Video transcripts processed locally when possible
- **No Data Storage**: Conversations not permanently stored on servers
- **Minimal Permissions**: Only requires access to YouTube pages
- **HTTPS Only**: All API communications encrypted
- **Google AI**: Transcripts may be processed by Google's Gemini API

## 🚨 Troubleshooting

### Common Issues

**"Not connected to YouTube"**
- Ensure you're on a YouTube video page (`youtube.com/watch?v=...`)
- Refresh the page and try again
- Check if the video has captions available

**"Backend connection failed"**  
- Verify the backend server is running (`http://localhost:8000`)
- Check your firewall settings
- Ensure all dependencies are installed

**"No transcript available"**
- Video may not have captions
- Try a different video with auto-generated captions
- Some videos may have restricted transcripts

**Extension not loading**
- Check browser console for errors (`F12`)
- Verify all files are in the correct locations
- Reload the extension in browser settings

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('ytchatbot_debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **YouTube Transcript API**: For transcript access
- **LangChain**: For AI orchestration framework  
- **Google Gemini**: For advanced language understanding
- **HuggingFace**: For open-source ML models
- **FAISS**: For efficient vector search

## 📞 Support

- 📧 **Email**: your-email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/yt-chatbot/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/yt-chatbot/discussions)

---

**Made with ❤️ for the YouTube community**