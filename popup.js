// popup.js - Enhanced Extension popup functionality
class YTChatBotPopup {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.videoInfo = document.getElementById('videoInfo');
        this.videoTitle = document.getElementById('videoTitle');
        this.contextSlider = document.getElementById('contextSlider');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.analyzeSection = document.getElementById('analyzeSection');
        this.analyzeProgress = document.getElementById('analyzeProgress');

        this.isConnected = false;
        this.isAnalyzed = false;
        this.currentVideoId = null;
        this.currentVideoTitle = null;
        this.chatHistory = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.checkYouTubeConnection();
        this.updateSliderFill();
    }

    setupEventListeners() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Analyze button
        this.analyzeBtn.addEventListener('click', () => this.analyzeVideo());

        // Slider
        this.contextSlider.addEventListener('input', (e) => {
            this.updateSliderValue(e.target, e.target.value + ' chunks');
            this.updateSliderFill();
            this.saveSettings();
        });

        // Buttons
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.exportChatBtn.addEventListener('click', () => this.exportChat());
        this.minimizeBtn.addEventListener('click', () => window.close());

        // Auto-refresh connection status
        setInterval(() => this.checkYouTubeConnection(), 2000);
    }

    updateSliderValue(slider, value) {
        const sliderValue = slider.parentElement.parentElement.querySelector('.slider-value');
        sliderValue.textContent = value;
    }

    updateSliderFill() {
        const slider = this.contextSlider;
        const sliderFill = document.querySelector('.slider-fill');
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        sliderFill.style.width = percentage + '%';
    }

    async checkYouTubeConnection() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
                const videoId = this.extractVideoId(tab.url);
                
                if (videoId !== this.currentVideoId) {
                    this.currentVideoId = videoId;
                    this.isAnalyzed = false;
                    
                    // Get video title
                    try {
                        const response = await chrome.tabs.sendMessage(tab.id, {
                            action: 'getVideoTitle'
                        });
                        this.currentVideoTitle = response?.title || `Video: ${videoId}`;
                    } catch (error) {
                        this.currentVideoTitle = `Video: ${videoId}`;
                    }

                    this.setConnectionStatus(true, 'Connected to YouTube video');
                    this.showAnalyzeButton();
                    this.disableChat();
                }
            } else {
                this.setConnectionStatus(false, 'Navigate to a YouTube video');
                this.hideAnalyzeButton();
                this.disableChat();
                this.currentVideoId = null;
                this.isAnalyzed = false;
            }
        } catch (error) {
            console.error('Error checking YouTube connection:', error);
            this.setConnectionStatus(false, 'Error connecting to YouTube');
        }
    }

    extractVideoId(url) {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    setConnectionStatus(connected, message) {
        this.isConnected = connected;
        const status = document.querySelector('.status');
        
        if (connected) {
            status.classList.add('connected');
            this.statusText.textContent = message;
            this.videoTitle.textContent = this.currentVideoTitle || 'Loading...';
            this.videoInfo.style.display = 'block';
        } else {
            status.classList.remove('connected', 'analyzing');
            this.statusText.textContent = message;
            this.videoInfo.style.display = 'none';
        }
    }

    showAnalyzeButton() {
        this.analyzeSection.style.display = 'block';
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.querySelector('.btn-text').textContent = 'Analyze Video';
        this.analyzeBtn.querySelector('.btn-icon').textContent = '🎬';
    }

    hideAnalyzeButton() {
        this.analyzeSection.style.display = 'none';
    }

    async analyzeVideo() {
        if (!this.currentVideoId) return;

        // Start analyzing state
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.classList.add('analyzing');
        this.analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';
        this.analyzeBtn.querySelector('.btn-icon').style.display = 'none';
        this.analyzeBtn.querySelector('.loading-spinner').style.display = 'block';
        this.analyzeProgress.style.display = 'block';
        
        const status = document.querySelector('.status');
        status.classList.add('analyzing');
        this.statusText.textContent = 'Analyzing video content...';

        try {
            // Send analyze request to backend
            const response = await fetch(`http://localhost:8000/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: "analyze_video_init", // Special command to initialize
                    video_id: this.currentVideoId,
                    temperature: 0.2,
                    contextK: parseInt(this.contextSlider.value)
                })
            });

            if (response.ok) {
                // Success
                this.isAnalyzed = true;
                this.setAnalyzeComplete();
                this.enableChat();
                this.addMessage("✅ Video analyzed successfully! You can now ask questions about the content.", 'bot');
            } else {
                throw new Error('Failed to analyze video');
            }

        } catch (error) {
            console.error('Error analyzing video:', error);
            this.setAnalyzeError();
            this.addMessage("❌ Failed to analyze video. Please make sure the video has captions available.", 'bot');
        }
    }

    setAnalyzeComplete() {
        this.analyzeBtn.classList.remove('analyzing');
        this.analyzeBtn.querySelector('.btn-text').textContent = '✅ Analysis Complete';
        this.analyzeBtn.querySelector('.btn-icon').style.display = 'inline';
        this.analyzeBtn.querySelector('.btn-icon').textContent = '✅';
        this.analyzeBtn.querySelector('.loading-spinner').style.display = 'none';
        this.analyzeProgress.style.display = 'none';
        
        const status = document.querySelector('.status');
        status.classList.remove('analyzing');
        status.classList.add('connected');
        this.statusText.textContent = 'Ready to chat about video';
    }

    setAnalyzeError() {
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.classList.remove('analyzing');
        this.analyzeBtn.querySelector('.btn-text').textContent = 'Retry Analysis';
        this.analyzeBtn.querySelector('.btn-icon').style.display = 'inline';
        this.analyzeBtn.querySelector('.btn-icon').textContent = '🔄';
        this.analyzeBtn.querySelector('.loading-spinner').style.display = 'none';
        this.analyzeProgress.style.display = 'none';
        
        const status = document.querySelector('.status');
        status.classList.remove('analyzing');
    }

    enableChat() {
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        this.messageInput.placeholder = "Ask me about the video...";
    }

    disableChat() {
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        this.messageInput.placeholder = this.isConnected ? "Click 'Analyze Video' first..." : "Navigate to a YouTube video first...";
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.isAnalyzed) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to backend
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    video_id: this.currentVideoId,
                    temperature: 0.2, // Fixed at reasonable value
                    contextK: parseInt(this.contextSlider.value)
                })
            });

            this.hideTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                this.addMessage(data.answer, 'bot');
            } else {
                this.addMessage("Sorry, I couldn't process your question. Please try again.", 'bot');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage("There was an error processing your request. Please make sure the backend server is running.", 'bot');
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = `avatar ${sender}-avatar`;
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p>${this.formatMessage(content)}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Add to history
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
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="avatar bot-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>Thinking</span>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    clearChat() {
        // Keep welcome message and any analysis messages
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach((message, index) => {
            if (index > 0) { // Keep first welcome message
                message.remove();
            }
        });
        this.chatHistory = [];
    }

    exportChat() {
        if (this.chatHistory.length === 0) {
            alert('No chat history to export');
            return;
        }

        const chatData = {
            videoId: this.currentVideoId,
            videoTitle: this.currentVideoTitle,
            exportDate: new Date().toISOString(),
            messages: this.chatHistory
        };

        const dataStr = JSON.stringify(chatData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `yt-chatbot-${this.currentVideoId}-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    saveSettings() {
        const settings = {
            contextK: this.contextSlider.value
        };
        
        chrome.storage.sync.set({ ytChatBotSettings: settings });
    }

    loadSettings() {
        chrome.storage.sync.get(['ytChatBotSettings'], (result) => {
            if (result.ytChatBotSettings) {
                const settings = result.ytChatBotSettings;
                
                if (settings.contextK) {
                    this.contextSlider.value = settings.contextK;
                    this.updateSliderValue(this.contextSlider, settings.contextK + ' chunks');
                    this.updateSliderFill();
                }
            }
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YTChatBotPopup();
});