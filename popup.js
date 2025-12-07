// Popup script for the ad blocker extension

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const blockedToday = document.getElementById('blocked-today');
  const totalBlocked = document.getElementById('total-blocked');
  const resetBtn = document.getElementById('reset-btn');
  const reportBtn = document.getElementById('report-btn');

  // Load initial stats
  loadStats();

  // Toggle click handler
  toggle.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleEnabled' }, (response) => {
      updateUI(response.enabled);
    });
  });

  // Reset stats button
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      chrome.runtime.sendMessage({ action: 'resetStats' }, () => {
        loadStats();
      });
    }
  });

  // Report issue button
  reportBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || '';
      const issueUrl = `https://github.com/yourusername/simple-ad-blocker/issues/new?title=Issue%20Report&body=URL:%20${encodeURIComponent(currentUrl)}%0A%0ADescription:%20`;
      chrome.tabs.create({ url: issueUrl });
    });
  });

  // Load stats from storage
  function loadStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      if (response) {
        blockedToday.textContent = formatNumber(response.blockedToday || 0);
        totalBlocked.textContent = formatNumber(response.totalBlocked || 0);
        updateUI(response.enabled !== false);
      }
    });
  }

  // Update UI based on enabled state
  function updateUI(enabled) {
    if (enabled) {
      toggle.classList.add('active');
      status.classList.add('active');
      status.classList.remove('inactive');
      statusIcon.textContent = '✓';
      statusText.textContent = 'Protection Active';
    } else {
      toggle.classList.remove('active');
      status.classList.remove('active');
      status.classList.add('inactive');
      statusIcon.textContent = '✗';
      statusText.textContent = 'Protection Disabled';
    }
  }

  // Format large numbers
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Auto-refresh stats every 2 seconds while popup is open
  setInterval(loadStats, 2000);
});