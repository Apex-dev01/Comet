// Comet Edge Proxy (CEP) - Vercel Edge Function Handler
// Implements streaming HTML rewriting with zero-latency Edge Config

export const config = {
  runtime: 'edge',
};

// HTMLRewriter for streaming response transformation
class ElementHandler {
  constructor(config) {
    this.config = config;
  }

  element(element) {
    // Rewrite URLs in the proxied content
    const attrs = ['href', 'src', 'action', 'data'];
    attrs.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        element.setAttribute(attr, this.rewriteUrl(value));
      }
    });
  }

  rewriteUrl(url) {
    if (!url || url.startsWith('data:') || url.startsWith('javascript:')) {
      return url;
    }
    // Encode and route through proxy
    const encoded = encodeURIComponent(url);
    return `/proxy/${encoded}`;
  }
}

// Inject Eruda and developer tools into head
class HeadHandler {
  constructor(config) {
    this.config = config;
  }

  element(element) {
    const devFeatures = this.config.DEV_FEATURES || {};
    
    // Always inject base rewriting script
    element.append(
      `<script src="/cep.js"></script>`,
      { html: true }
    );

    // Inject Eruda if enabled
    if (devFeatures.eruda !== false) {
      element.append(
        `<script src="https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js"></script>`,
        { html: true }
      );
    }
  }
}

// Inject developer activation controls into body
class BodyHandler {
  constructor(config) {
    this.config = config;
  }

  element(element) {
    const devFeatures = this.config.DEV_FEATURES || {};

    // Inject Eruda activator button if enabled
    if (devFeatures.eruda !== false) {
      element.append(
        `<div id="cep-debug-trigger" style="position:fixed;bottom:10px;right:10px;z-index:999999;">
          <button onclick="window.comet && window.comet.activateEruda()" 
                  style="width:40px;height:40px;border-radius:50%;background:#f44336;color:white;border:none;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-size:20px;">
            🐛
          </button>
        </div>`,
        { html: true }
      );
    }
  }
}

// Main Edge Function handler
export default async function handler(req) {
  const url = new URL(req.url);
  
  // Extract target URL from path
  const targetUrl = url.pathname.replace('/proxy/', '');
  const decodedUrl = decodeURIComponent(targetUrl);

  if (!decodedUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  try {
    // Load Edge Config (ultra-low latency <1ms)
    const edgeConfig = await getEdgeConfig();

    // Fetch target content
    const targetResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    const contentType = targetResponse.headers.get('content-type') || '';

    // Only rewrite HTML responses
    if (!contentType.includes('text/html')) {
      return targetResponse;
    }

    // Stream and rewrite HTML using HTMLRewriter
    const rewriter = new HTMLRewriter()
      .on('head', new HeadHandler(edgeConfig))
      .on('body', new BodyHandler(edgeConfig))
      .on('a, link, script, img, iframe, form', new ElementHandler(edgeConfig));

    const transformedResponse = rewriter.transform(targetResponse);

    // Add proxy headers
    const headers = new Headers(transformedResponse.headers);
    headers.set('X-Proxied-By', 'Comet-Edge-Proxy');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(transformedResponse.body, {
      status: transformedResponse.status,
      headers,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Proxy Error: ${error.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Get Edge Config with fallback
async function getEdgeConfig() {
  try {
    // In production, use Vercel Edge Config
    // const { get } = require('@vercel/edge-config');
    // return await get('cep_config');
    
    // Default configuration
    return {
      DEV_FEATURES: {
        eruda: true,
        customTheme: false,
      },
      ENCODING_KEY: 'comet-proxy-v1',
      BLOCKLIST: [],
    };
  } catch (error) {
    console.error('Edge Config error:', error);
    return {
      DEV_FEATURES: { eruda: true },
      ENCODING_KEY: 'comet-proxy-v1',
      BLOCKLIST: [],
    };
  }
}
