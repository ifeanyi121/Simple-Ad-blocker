# 🛡️ Simple Ad Blocker

A lightweight, privacy-focused Chrome extension that blocks ads and trackers to give you a cleaner, faster browsing experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chrome Web Store](https://img.shields.io/badge/platform-Chrome-green.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)

## Features

- **Network-level blocking**: Uses Chrome's `declarativeNetRequest` API to block ad requests before they load
- **DOM-based blocking**: Removes ad elements from web pages for a cleaner experience
- **50+ ad networks blocked**: Including Google Ads, Facebook Ads, Taboola, Outbrain, and more
- **Tracker blocking**: Blocks common analytics and tracking scripts
- **Statistics tracking**: See how many ads have been blocked today and in total
- **Toggle on/off**: Easily enable or disable the blocker
- **Lightweight**: Minimal impact on browser performance
- **Privacy-focused**: No data collection, everything runs locally

## Screenshots

*Coming soon*

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/ifeanyi121/simple-ad-blocker.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked**

5. Select the `simple-ad-blocker` folder

6. The extension is now installed and active!

### From Chrome Web Store

*Coming soon*

## Usage

1. Click the extension icon in your browser toolbar to open the popup
2. View your blocking statistics
3. Toggle the extension on/off using the switch
4. Click "Reset Stats" to clear your statistics
5. Click "Report Issue" to report a website where ads aren't being blocked

## How It Works

The extension uses a two-pronged approach to block ads:

### 1. Network Request Blocking (`declarativeNetRequest`)

The extension uses Chrome's Manifest V3 `declarativeNetRequest` API to block requests to known ad servers and tracking domains at the network level. This prevents ads from loading in the first place, saving bandwidth and improving page load times.

Blocked domains include:
- `doubleclick.net`
- `googlesyndication.com`
- `googleadservices.com`
- `facebook.com/ads`
- `amazon-adsystem.com`
- `taboola.com`
- `outbrain.com`
- And 40+ more...

### 2. Content Script (DOM Manipulation)

A content script runs on every page to:
- Hide ad containers that slip through network blocking
- Remove common ad elements by CSS selectors
- Use a MutationObserver to catch dynamically loaded ads

## Project Structure

```
simple-ad-blocker/
├── manifest.json       # Extension configuration
├── rules.json          # Network blocking rules
├── background.js       # Service worker for stats
├── content.js          # DOM-based ad blocking
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Customization

### Adding Custom Block Rules

Edit `rules.json` to add new domains to block:

```json
{
  "id": 51,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "||example-ad-network.com^",
    "resourceTypes": ["script", "image", "sub_frame"]
  }
}
```

### Adding DOM Selectors

Edit the `adSelectors` array in `content.js` to add new CSS selectors:

```javascript
const adSelectors = [
  // ... existing selectors
  '.your-custom-ad-selector',
  '#another-ad-id'
];
```

## Privacy

This extension:
- ✅ Does NOT collect any user data
- ✅ Does NOT send any information to external servers
- ✅ Runs entirely locally in your browser
- ✅ Is open source for full transparency

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue describing the problem
2. **Suggest features**: Open an issue with your idea
3. **Submit PRs**: Fork the repo and submit a pull request

### Development Setup

1. Clone the repo
2. Make your changes
3. Load the extension in Chrome (Developer mode)
4. Test your changes
5. Submit a PR

## Known Limitations

- Some websites may detect ad blockers and restrict content
- YouTube video ads may still play (YouTube frequently changes their ad delivery)
- Some native/sponsored content may not be blocked if it's loaded from the same domain

## Roadmap

- [ ] Whitelist specific websites
- [ ] Custom filter lists support
- [ ] Element picker for manual blocking
- [ ] Import/export settings
- [ ] Firefox support
- [ ] Statistics graphs

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by uBlock Origin and AdBlock Plus
- Built with Chrome's Manifest V3 APIs

---

**Made with ❤️ for a cleaner web**

If you find this useful, please ⭐ star the repository!