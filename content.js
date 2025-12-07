// Content script for DOM-based ad blocking
(function() {
  'use strict';
  let isEnabled = true;

  // Selectors that are DEFINITELY ads - hide immediately
  const definiteAdSelectors = [
    // Google Ads
    'ins.adsbygoogle',
    '[data-ad-client]',
    '[data-ad-slot]',
    '.adsbygoogle',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="googleadservices.com"]',
    
    // Common ad networks
    '.taboola',
    '.trc_related_container',
    '[id^="taboola-"]',
    '.OUTBRAIN',
    '[id^="outbrain-"]',
    '[data-widget-id*="outbrain"]',
    
    // Explicit ad labels
    '[aria-label="Advertisement"]',
    '[aria-label="Sponsored"]',
    '[data-ad]',
    '[data-ads]',
    '[data-advertisement]',
    
    // Common ad classes
    '.advertisement',
    '.ad-banner',
    '.ad-container',
    '.ad-wrapper',
    '.ad-slot',
    '.ad-unit',
    '.sponsored-content',
    '.sponsored-ad',
    '.promoted-content',
    '.native-ad',
    
    // Ad iframes
    'iframe[src*="ads"]',
    'iframe[id*="google_ads"]',
    'iframe[src*="adserver"]'
  ];

  function hideAds() {
    if (!isEnabled) return;
    
    let newlyBlocked = 0;
    
    definiteAdSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!el.dataset.adBlockerHidden) {
            el.style.setProperty('display', 'none', 'important');
            el.dataset.adBlockerHidden = 'true';
            newlyBlocked++;
            console.log('[AdBlocker] Blocked:', selector, el);
          }
        });
      } catch (e) {}
    });
    
    // Report blocked count to background script
    if (newlyBlocked > 0) {
      console.log('[AdBlocker] Total blocked this pass:', newlyBlocked);
      try {
        chrome.runtime.sendMessage({ action: 'adBlocked', count: newlyBlocked }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('[AdBlocker] Message error:', chrome.runtime.lastError);
          } else {
            console.log('[AdBlocker] Message sent successfully');
          }
        });
      } catch (e) {
        console.log('[AdBlocker] Send error:', e);
      }
    }
  }

  // Observe DOM changes for dynamically loaded ads
  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;
    
    let hasNewNodes = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    
    if (hasNewNodes) {
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(hideAds, 150);
    }
  });

  function init() {
    console.log('[AdBlocker] Content script loaded');
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['enabled'], (result) => {
        isEnabled = result.enabled !== false;
        console.log('[AdBlocker] Enabled:', isEnabled);
        if (isEnabled) {
          startBlocking();
        }
      });
      
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.enabled) {
          isEnabled = changes.enabled.newValue;
          if (isEnabled) {
            hideAds();
          }
        }
      });
    } else {
      startBlocking();
    }
  }

  function startBlocking() {
    console.log('[AdBlocker] Starting to block ads');
    
    // Run immediately
    hideAds();
    
    // Start observing
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true 
    });
    
    // Also run on various load events
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideAds);
    }
    window.addEventListener('load', hideAds);
    
    // Periodic check for lazy-loaded ads
    setInterval(hideAds, 3000);
  }

  init();
})();