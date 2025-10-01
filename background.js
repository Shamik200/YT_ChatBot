// background.js - Fixed Service worker for the extension
console.log('YT ChatBot Background Service Worker Started');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('YT ChatBot Extension Installed');
    
    // Set default settings
    chrome.storage.sync.set({
        ytChatBotSettings: {
            contextK: 4,
            autoConnect: true
        }
    });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only process complete page loads
    if (changeInfo.status !== 'complete' || !tab.url) return;

    // Check if it's a YouTube video page
    if (tab.url.includes('youtube.com/watch')) {
        console.log('YouTube video page detected:', tab.url);
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        switch (request.action) {
            case 'getTabInfo':
                if (sender.tab) {
                    chrome.tabs.get(sender.tab.id).then(tab => {
                        sendResponse({ success: true, tab });
                    }).catch(error => {
                        sendResponse({ success: false, error: error.message });
                    });
                } else {
                    sendResponse({ success: false, error: 'No tab info available' });
                }
                break;

            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Error handling message in background:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep the message channel open
});