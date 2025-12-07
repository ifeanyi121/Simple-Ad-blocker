// Content script for DOM-based ad blocking
(function() {
  'use strict';

  // Check if extension is enabled
  let isEnabled = true;

  // Common ad-related selectors
  const adSelectors = [
    // Generic ad containers
    '[class*="ad-"]',
    '[class*="-ad-"]',
    '[class*="_ad_"]',
    '[class*="ad_"]',
    '[id*="ad-"]',
    '[id*="-ad-"]',
    '[id*="_ad_"]',
    '[id*="ad_"]',
    '[class*="ads-"]',
    '[class*="-ads-"]',
    '[class*="ads_"]',
    '[id*="ads-"]',
    '[id*="-ads-"]',
    '[id*="ads_"]',
    
    // Common ad class names
    '.advertisement',
    '.advertisment',
    '.advert',
    '.ad-container',
    '.ad-wrapper',
    '.ad-banner',
    '.ad-box',
    '.ad-slot',
    '.ad-unit',
    '.adsbygoogle',
    '.adbanner',
    '.adblock',
    '.adspace',
    '.adarea',
    '.sponsored-content',
    '.sponsored-ad',
    '.promoted-content',
    '.native-ad',
    
    // Google Ads
    'ins.adsbygoogle',
    '[data-ad-client]',
    '[data-ad-slot]',
    
    // Common ad IDs
    '#ad-container',
    '#ad-wrapper',
    '#advertisement',
    '#banner-ad',
    '#sidebar-ad',
    '#top-ad',
    '#bottom-ad',
    
    // Social media ads
    '[data-testid="placementTracking"]',
    
    // Taboola/Outbrain
    '.taboola',
    '.trc_related_container',
    '[id^="taboola-"]',
    '.OUTBRAIN',
    '[data-widget-id*="outbrain"]',
    
    // Other common patterns
    '[aria-label="Advertisement"]',
    '[aria-label="Sponsored"]',
    '[data-ad]',
    '[data-ads]',
    '[data-advertisement]'
  ];

  // Elements to hide (less aggressive - just hides instead of removes)
  const hideSelectors = [
    '.ad-placeholder',
    '.ad-loading'
  ];

  // Function to hide ad elements
  function hideAds() {
    if (!isEnabled) return;

    // Remove ad elements
    adSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Skip if already processed
          if (el.dataset.adBlockerProcessed) return;
          
          // Check if element is likely an ad (has minimal content that's not useful)
          const isLikelyAd = checkIfLikelyAd(el);
          
          if (isLikelyAd) {
            el.style.display = 'none';
            el.dataset.adBlockerProcessed = 'true';
          }
        });
      } catch (e) {
        // Selector might be invalid, skip it
      }
    });

    // Hide placeholder elements
    hideSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
  }

  // Check if element is likely an ad
  function checkIfLikelyAd(element) {
    const classAndId = (element.className + ' ' + element.id).toLowerCase();
    
    // Strong indicators
    const strongIndicators = [
      'adsbygoogle',
      'advertisement',
      'sponsored',
      'taboola',
      'outbrain',
      'promoted',
      'dfp-ad',
      'google-ad'
    ];
    
    for (const indicator of strongIndicators) {
      if (classAndId.includes(indicator)) {
        return true;
      }
    }
    
    // Check for ad-related attributes
    if (element.hasAttribute('data-ad-client') || 
        element.hasAttribute('data-ad-slot') ||
        element.hasAttribute('data-advertisement')) {
      return true;
    }
    
    // Check aria labels
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && (ariaLabel.toLowerCase().includes('advertisement') || 
                      ariaLabel.toLowerCase().includes('sponsored'))) {
      return true;
    }
    
    return false;
  }

  // Block inline ad scripts
  function blockInlineScripts() {
    if (!isEnabled) return;

    const scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(script => {
      const content = script.textContent.toLowerCase();
      const adPatterns = [
        'googletag',
        'adsbygoogle',
        'doubleclick',
        'googleadservices'
      ];
      
      for (const pattern of adPatterns) {
        if (content.includes(pattern)) {
          script.textContent = '';
          break;
        }
      }
    });
  }

  // Create a MutationObserver to handle dynamically loaded ads
  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;
    
    let shouldCheck = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck) {
      // Debounce the ad hiding
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(() => {
        hideAds();
      }, 100);
    }
  });

  // Initialize
  function init() {
    // Check if enabled in storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['enabled'], (result) => {
        isEnabled = result.enabled !== false; // Default to true
        if (isEnabled) {
          startBlocking();
        }
      });
      
      // Listen for changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
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
    // Initial cleanup
    hideAds();
    blockInlineScripts();
    
    // Start observing
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // Also run on DOMContentLoaded and load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideAds);
    }
    window.addEventListener('load', hideAds);
  }

  // Run initialization
  init();
})();