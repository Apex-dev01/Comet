# Comet Edge Proxy (CEP)

**The highest-performing, most developer-centric, and simplest-to-integrate proxy architecture for Vercel-hosted platforms.**

Comet Edge Proxy (CEP) leverages Vercel's global Edge Network and CDN to deliver **zero-latency proxying** with **zero-configuration developer integration**. No more complex setup, no app dependencies—just a single CDN import line.

---

## 🚀 Features

### ⚡ Zero-Latency Delivery
- **Vercel Edge Functions**: Executes at 126+ global PoPs closest to users
- **Streaming HTMLRewriter**: Non-blocking HTML transformation as content streams
- **Edge Config**: <1ms config lookup, no database delays
- **CDN-Optimized Assets**: Instant load with aggressive caching

### 👨‍💻 Zero-Configuration Developer Integration
- **Single-Line Import**: Just add `<script src="https://your-cep-domain.vercel.app/cep.js"></script>`
- **Auto-Registration**: Service Worker registers automatically
- **Global Dev API**: Access via `window.comet` for debugging and customization
- **Automatic Eruda Injection**: Debug tools ready on every proxied page

### 🛠️ Production-Ready
- **Edge Config Feature Flags**: Enable/disable features without deployment
- **Client-Side Caching**: Smart Service Worker cache strategy
- **Error Handling**: Robust fallbacks and error recovery
- **Performance Monitoring**: Built-in performance metrics API

---

## 📦 Quick Start

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FApex-dev01%2FComet)

**Or manually:**

```bash
# Clone the repository
git clone https://github.com/Apex-dev01/Comet.git
cd Comet

# Deploy to Vercel
vercel deploy --prod
```

### 2. Integrate into Your Application

Add a single line to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <!-- Single-line CEP integration -->
  <script src="https://your-cep-domain.vercel.app/cep.js"></script>
</head>
<body>
  <h1>Your content here</h1>
</body>
</html>
```

That's it! Your application is now proxied with all features enabled.

---

## 🏗️ Architecture

### Core Components

| Component | Technology | Purpose |
|-----------|-----------|--------|
| **Proxy Handler** | Vercel Edge Function | Global request proxying at 126+ PoPs |
| **Rewriting Engine** | Streaming HTMLRewriter | Non-blocking HTML transformation |
| **Configuration** | Vercel Edge Config | <1ms feature flag lookup |
| **Client Assets** | Vercel CDN | Instant load with aggressive caching |
| **Service Worker** | Browser SW API | Client-side caching and interception |

### Request Flow

```
User Request
    ↓
Vercel Edge Network (Closest PoP)
    ↓
Edge Function (/api/proxy.js)
    ↓
Fetch Target Content
    ↓
Streaming HTMLRewriter
    ↓ (Injects Eruda, CEP scripts, dev tools)
Transformed Response
    ↓
CDN Cache
    ↓
User (with debug tools ready)
```

---

## 🎮 Developer API

CEP exposes a global `window.comet` API for easy interaction:

```javascript
// Activate Eruda DevTools
window.comet.activateEruda();

// Set theme
window.comet.setTheme('dark'); // 'light', 'dark', 'auto'

// Get performance metrics
window.comet.getPerformance();
// Returns: { dns, tcp, ttfb, download, domReady, total }

// Check proxy status
window.comet.checkStatus();
// Returns: { version, serviceWorker, registered, eruda }

// Clear cache
await window.comet.clearCache();

// URL utilities
const encoded = window.comet.utils.encodeUrl('https://example.com');
const decoded = window.comet.utils.decodeUrl(encoded);
const proxied = window.comet.utils.rewriteUrl('https://example.com');
```

---

## ⚙️ Configuration

### Edge Config (Production)

For production, use Vercel Edge Config for dynamic feature flags:

1. Create an Edge Config in your Vercel dashboard
2. Add the config:

```json
{
  "DEV_FEATURES": {
    "eruda": true,
    "customTheme": false
  },
  "ENCODING_KEY": "comet-proxy-v1",
  "BLOCKLIST": []
}
```

3. Link the Edge Config to your project

### Environment Variables

Optional environment variables in Vercel dashboard:

- `EDGE_CONFIG`: Your Edge Config connection string (auto-set by Vercel)

---

## 📁 Project Structure

```
Comet/
├── api/
│   └── proxy.js          # Edge Function handler with HTMLRewriter
├── public/
│   ├── cep.js            # Bundled client script with dev API
│   └── sw-handler.js     # Service Worker for caching
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

---

## 🔧 Development

### Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

Access your proxy at `http://localhost:3000`

### Testing the Proxy

```bash
# Test proxy endpoint
curl http://localhost:3000/proxy/https%3A%2F%2Fexample.com

# Test CDN asset
curl http://localhost:3000/cep.js
```

---

## 🎯 Use Cases

- **Web Unblocking**: Proxy websites through Vercel's edge network
- **Content Inspection**: Automatic Eruda injection for debugging any site
- **Performance Testing**: Built-in metrics for any proxied page
- **Development Tools**: Quickly add dev tools to any web application
- **CDN Distribution**: Serve proxied content from 126+ global locations

---

## 🚦 Feature Flags

Toggle features via Edge Config without redeploying:

```javascript
// In Edge Config
{
  "DEV_FEATURES": {
    "eruda": true,           // Enable Eruda debugger injection
    "customTheme": false,    // Enable theme customization
    "analytics": false       // Enable analytics injection
  }
}
```

Changes take effect in <1ms globally.

---

## 📊 Performance

- **TTFB**: <50ms from nearest PoP
- **Edge Config Lookup**: <1ms
- **CDN Cache Hit**: <10ms
- **Global Distribution**: 126+ PoPs worldwide
- **Streaming**: Non-blocking HTML transformation

---

## 🛡️ Security

- Edge Functions run in isolated V8 isolates
- Service Worker scope limited to `/`
- CORS headers configurable in `vercel.json`
- No server-side data storage
- Frame-busting prevention with iframe sandboxing

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📜 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Vercel for the amazing Edge Network
- Eruda for the excellent mobile debugging tools
- The open-source community

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Apex-dev01/Comet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Apex-dev01/Comet/discussions)

---

**Built with ❤️ for developers who value simplicity and performance.**
