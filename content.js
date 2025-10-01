// content.js - YouTube sliding panel content script
class YTChatBotPanel {
    constructor() {
        this.isConnected = false;
        this.isAnalyzed = false;
        this.currentVideoId = null;
        this.currentVideoTitle = null;
        this.chatHistory = [];
        this.contextK = 4;
        
        this.init();
    }

    init() {
        console.log('YT ChatBot Panel Loaded');
        this.createPanel();
        this.setupEventListeners();
        this.checkCurrentVideo();
        
        // Monitor for video changes
        setInterval(() => this.checkCurrentVideo(), 2000);
    }

    createPanel() {
        // Remove existing panel
        const existing = document.getElementById('yt-chatbot-panel');
        if (existing) existing.remove();

        // Create toggle button
        this.createToggleButton();

        // Create main panel
        const panel = document.createElement('div');
        panel.id = 'yt-chatbot-panel';
        panel.innerHTML = `
            <div class="yt-chatbot-header">
                <div class="yt-chatbot-logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.593 7.203c-.23-1.69-1.675-3.024-3.362-3.24C16.233 3.8 12 3.8 12 3.8s-4.233 0-6.231.163c-1.687.216-3.132 1.55-3.362 3.24C2.25 9.203 2.25 12 2.25 12s0 2.797.157 4.797c.23 1.69 1.675 3.024 3.362 3.24 1.998.163 6.231.163 6.231.163s4.233 0 6.231-.163c1.687-.216 3.132-1.55 3.362-3.24.157-2 .157-4.797.157-4.797s0-2.797-.157-4.797z" fill="#FFF"/>
                        <path d="m9.75 15.02 4.171-2.404L9.75 10.213v4.807z" fill="#FF416C"/>
                    </svg>
                    <h1>YT ChatBot</h1>
                </div>
                <button class="yt-chatbot-close" id="yt-chatbot-close">×</button>
            </div>
            
            <div class="yt-chatbot-status-section">
                <div class="yt-chatbot-status" id="yt-chatbot-status">
                    <div class="yt-chatbot-status-indicator"></div>
                    <div class="yt-chatbot-status-info">
                        <div class="yt-chatbot-status-text" id="yt-chatbot-status-text">Navigate to a YouTube video</div>
                        <div class="yt-chatbot-video-info" id="yt-chatbot-video-info" style="display: none;">
                            <div class="yt-chatbot-video-title" id="yt-chatbot-video-title">Video Title</div>
                        </div>
                    </div>
                </div>
                
                <div class="yt-chatbot-analyze-section" id="yt-chatbot-analyze-section" style="display: none;">
                    <button class="yt-chatbot-analyze-btn" id="yt-chatbot-analyze-btn">
                        <span id="yt-chatbot-analyze-icon">🎬</span>
                        <span id="yt-chatbot-analyze-text">Analyze Video</span>
                        <div class="yt-chatbot-loading" id="yt-chatbot-analyze-loading" style="display: none;"></div>
                    </button>
                </div>
            </div>

            <div class="yt-chatbot-chat-container">
                <div class="yt-chatbot-messages" id="yt-chatbot-messages">
                    <div class="yt-chatbot-message">
                        <div class="yt-chatbot-avatar bot">🤖</div>
                        <div class="yt-chatbot-message-content">
                            Hello! I'm your YouTube AI assistant. Navigate to a video and click "Analyze Video" to start chatting!
                        </div>
                    </div>
                </div>
                
                <div class="yt-chatbot-input-container">
                    <div class="yt-chatbot-input-wrapper">
                        <input type="text" class="yt-chatbot-input" id="yt-chatbot-input" placeholder="Click 'Analyze Video' first..." disabled>
                        <button class="yt-chatbot-send-btn" id="yt-chatbot-send-btn" disabled>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="yt-chatbot-controls">
                <div class="yt-chatbot-control-group">
                    <label>Context Detail Level</label>
                    <div class="yt-chatbot-slider-container">
                        <input type="range" class="yt-chatbot-slider" id="yt-chatbot-context-slider" min="2" max="8" step="1" value="4">
                        <div class="yt-chatbot-slider-labels">
                            <span>Quick</span>
                            <span>Detailed</span>
                        </div>
                        <div class="yt-chatbot-slider-value" id="yt-chatbot-slider-value">4 chunks</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        
        // Get elements
        this.panel = panel;
        this.statusElement = document.getElementById('yt-chatbot-status');
        this.statusText = document.getElementById('yt-chatbot-status-text');
        this.videoInfo = document.getElementById('yt-chatbot-video-info');
        this.videoTitle = document.getElementById('yt-chatbot-video-title');
        this.analyzeSection = document.getElementById('yt-chatbot-analyze-section');
        this.analyzeBtn = document.getElementById('yt-chatbot-analyze-btn');
        this.analyzeIcon = document.getElementById('yt-chatbot-analyze-icon');
        this.analyzeText = document.getElementById('yt-chatbot-analyze-text');
        this.analyzeLoading = document.getElementById('yt-chatbot-analyze-loading');
        this.messages = document.getElementById('yt-chatbot-messages');
        this.input = document.getElementById('yt-chatbot-input');
        this.sendBtn = document.getElementById('yt-chatbot-send-btn');
        this.contextSlider = document.getElementById('yt-chatbot-context-slider');
        this.sliderValue = document.getElementById('yt-chatbot-slider-value');
    }

    createToggleButton() {
        const existing = document.getElementById('yt-chatbot-toggle');
        if (existing) existing.remove();

        const toggle = document.createElement('div');
        toggle.id = 'yt-chatbot-toggle';
        toggle.innerHTML = '🤖';
        document.body.appendChild(toggle);
        this.toggleBtn = toggle;
    }

    setupEventListeners() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());
        document.getElementById('yt-chatbot-close').addEventListener('click', () => this.togglePanel());

        // Analyze video
        this.analyzeBtn.addEventListener('click', () => this.analyzeVideo());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Context slider
        this.contextSlider.addEventListener('input', (e) => {
            this.contextK = parseInt(e.target.value);
            this.sliderValue.textContent = `${e.target.value} chunks`;
        });

        // Listen for messages from popup (if any)
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getVideoTitle') {
                sendResponse({ title: this.getVideoTitle() });
            }
        });
    }

    togglePanel() {
        const isOpen = this.panel.classList.contains('open');
        if (isOpen) {
            this.panel.classList.remove('open');
            this.toggleBtn.classList.remove('panel-open');
        } else {
            this.panel.classList.add('open');
            this.toggleBtn.classList.add('panel-open');
        }
    }

    checkCurrentVideo() {
        const videoId = this.extractVideoId(window.location.href);
        
        if (videoId && videoId !== this.currentVideoId) {
            this.currentVideoId = videoId;
            this.currentVideoTitle = this.getVideoTitle();
            this.isAnalyzed = false;
            
            this.setConnectionStatus(true, 'Connected to YouTube video');
            this.showAnalyzeButton();
            this.disableChat();
        } else if (!videoId && this.currentVideoId) {
            this.currentVideoId = null;
            this.currentVideoTitle = null;
            this.isAnalyzed = false;
            
            this.setConnectionStatus(false, 'Navigate to a YouTube video');
            this.hideAnalyzeButton();
            this.disableChat();
        }
    }

    extractVideoId(url) {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    getVideoTitle() {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') || 
                           document.querySelector('#title h1') ||
                           document.querySelector('h1.title') ||
                           document.querySelector('.ytd-video-primary-info-renderer h1');
        
        return titleElement ? titleElement.textContent.trim() : 'YouTube Video';
    }

    setConnectionStatus(connected, message) {
        this.isConnected = connected;
        
        if (connected) {
            this.statusElement.classList.add('connected');
            this.statusText.textContent = message;
            this.videoTitle.textContent = this.currentVideoTitle || 'Loading...';
            this.videoInfo.style.display = 'block';
        } else {
            this.statusElement.classList.remove('connected', 'analyzing');
            this.statusText.textContent = message;
            this.videoInfo.style.display = 'none';
        }
    }

    showAnalyzeButton() {
        this.analyzeSection.style.display = 'block';
        this.analyzeBtn.disabled = false;
        this.analyzeText.textContent = 'Analyze Video';
        this.analyzeIcon.textContent = '🎬';
    }

    hideAnalyzeButton() {
        this.analyzeSection.style.display = 'none';
    }

    async analyzeVideo() {
        if (!this.currentVideoId) return;

        // Start analyzing
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.classList.add('analyzing');
        this.analyzeText.textContent = 'Analyzing...';
        this.analyzeIcon.style.display = 'none';
        this.analyzeLoading.style.display = 'block';
        this.statusElement.classList.add('analyzing');
        this.statusText.textContent = 'Analyzing video content...';

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: "analyze_video_init",
                    video_id: this.currentVideoId,
                    temperature: 0.2,
                    contextK: this.contextK
                })
            });

            if (response.ok) {
                this.isAnalyzed = true;
                this.setAnalyzeComplete();
                this.enableChat();
                this.addMessage("✅ Video analyzed successfully! You can now ask questions about the content.", 'bot');
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to analyze video');
            }

        } catch (error) {
            console.error('Error analyzing video:', error);
            this.setAnalyzeError();
            this.addMessage(`❌ Failed to analyze video: ${error.message}. Please make sure the video has captions available.`, 'bot');
        }
    }

    setAnalyzeComplete() {
        this.analyzeBtn.classList.remove('analyzing');
        this.analyzeText.textContent = '✅ Analysis Complete';
        this.analyzeIcon.style.display = 'inline';
        this.analyzeIcon.textContent = '✅';
        this.analyzeLoading.style.display = 'none';
        this.statusElement.classList.remove('analyzing');
        this.statusElement.classList.add('connected');
        this.statusText.textContent = 'Ready to chat about video';
    }

    setAnalyzeError() {
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.classList.remove('analyzing');
        this.analyzeText.textContent = 'Retry Analysis';
        this.analyzeIcon.style.display = 'inline';
        this.analyzeIcon.textContent = '🔄';
        this.analyzeLoading.style.display = 'none';
        this.statusElement.classList.remove('analyzing');
    }

    enableChat() {
        this.input.disabled = false;
        this.sendBtn.disabled = false;
        this.input.placeholder = "Ask me about the video...";
    }

    disableChat() {
        this.input.disabled = true;
        this.sendBtn.disabled = true;
        this.input.placeholder = this.isConnected ? "Click 'Analyze Video' first..." : "Navigate to a YouTube video first...";
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || !this.isAnalyzed) return;

        this.addMessage(message, 'user');
        this.input.value = '';
        this.showTypingIndicator();

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    video_id: this.currentVideoId,
                    temperature: 0.2,
                    contextK: this.contextK
                })
            });

            this.hideTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                this.addMessage(data.answer, 'bot');
            } else {
                const error = await response.json();
                this.addMessage(`Sorry, I couldn't process your question: ${error.detail || 'Unknown error'}`, 'bot');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage("There was an error processing your request. Please make sure the backend server is running.", 'bot');
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'yt-chatbot-message';
        if (sender === 'user') messageDiv.classList.add('user');

        messageDiv.innerHTML = `
            <div class="yt-chatbot-avatar ${sender}">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="yt-chatbot-message-content">${this.formatMessage(content)}</div>
        `;

        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
        
        this.chatHistory.push({ sender, content, timestamp: new Date() });
    }

    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'yt-chatbot-message typing-message';
        typingDiv.innerHTML = `
            <div class="yt-chatbot-avatar bot">🤖</div>
            <div class="yt-chatbot-message-content">
                <div class="yt-chatbot-typing">
                    <span>Thinking</span>
                    <div class="yt-chatbot-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.messages.appendChild(typingDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingMessage = this.messages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
}

// Initialize the panel
console.log('YT ChatBot Content Script Loaded');

// Wait for page to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new YTChatBotPanel(), 1000);
    });
} else {
    setTimeout(() => new YTChatBotPanel(), 1000);
}