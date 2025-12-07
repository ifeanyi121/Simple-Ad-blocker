// Background service worker for the ad blocker

// Initialize stats
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: true,
    totalBlocked: 0,
    blockedToday: 0,
    lastResetDate: new Date().toDateString()
  });
});

// Track blocked requests
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  updateBlockedCount();
});

// Fallback: Use webRequest if available to count blocks
if (chrome.webRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      // This won't actually block (declarativeNetRequest does that)
      // but we can use it to track
    },
    { urls: ["<all_urls>"] }
  );
}

// Update blocked count
async function updateBlockedCount() {
  try {
    const data = await chrome.storage.sync.get(['totalBlocked', 'blockedToday', 'lastResetDate']);
    
    const today = new Date().toDateString();
    let blockedToday = data.blockedToday || 0;
    
    // Reset daily counter if it's a new day
    if (data.lastResetDate !== today) {
      blockedToday = 0;
    }
    
    await chrome.storage.sync.set({
      totalBlocked: (data.totalBlocked || 0) + 1,
      blockedToday: blockedToday + 1,
      lastResetDate: today
    });
  } catch (error) {
    console.error('Error updating blocked count:', error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.sync.get(['totalBlocked', 'blockedToday', 'enabled'], (data) => {
      sendResponse(data);
    });
    return true; // Required for async response
  }
  
  if (request.action === 'toggleEnabled') {
    chrome.storage.sync.get(['enabled'], (data) => {
      const newState = !data.enabled;
      chrome.storage.sync.set({ enabled: newState }, () => {
        // Update extension icon based on state
        updateIcon(newState);
        sendResponse({ enabled: newState });
      });
    });
    return true;
  }
  
  if (request.action === 'resetStats') {
    chrome.storage.sync.set({
      totalBlocked: 0,
      blockedToday: 0,
      lastResetDate: new Date().toDateString()
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Update extension icon based on enabled state
function updateIcon(enabled) {
  const iconPath = enabled ? {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png'
  } : {
    16: 'icons/icon16-disabled.png',
    48: 'icons/icon48-disabled.png',
    128: 'icons/icon128-disabled.png'
  };
  
  chrome.action.setIcon({ path: iconPath }).catch(() => {
    // Icon files might not exist, that's okay
  });
}

// Check and reset daily stats at startup
chrome.runtime.onStartup?.addListener(() => {
  chrome.storage.sync.get(['lastResetDate'], (data) => {
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
      chrome.storage.sync.set({
        blockedToday: 0,
        lastResetDate: today
      });
    }
  });
});