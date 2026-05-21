export default function handler(req, res) {
  const {
    title = 'CrossLedger (CLXT)',
    subtitle = 'Institutional-Grade Settlement. Early-Stage Entry.',
    badge = 'Stage 1 Presale Live \u00b7 $0.10 / CLXT',
  } = req.query;

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0f1e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d1a2e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="4" fill="#3b82f6" />
  <text x="60" y="120" font-family="system-ui,sans-serif" font-size="48" font-weight="800" fill="#ffffff" letter-spacing="-1">CROSSLEDGER</text>
  <text x="60" y="200" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="#e2e8f0">${title}</text>
  <text x="60" y="260" font-family="system-ui,sans-serif" font-size="24" font-weight="400" fill="#94a3b8">${subtitle}</text>
  <rect x="60" y="310" width="420" height="48" rx="8" fill="#1d4ed8" />
  <text x="270" y="342" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle">${badge}</text>
  <rect x="800" y="180" width="320" height="180" rx="16" fill="#0f172a" stroke="#3b82f6" stroke-width="1" />
  <text x="960" y="240" font-family="system-ui,sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">CLXT Token Price</text>
  <text x="960" y="300" font-family="system-ui,sans-serif" font-size="48" font-weight="800" fill="#3b82f6" text-anchor="middle">$0.10</text>
  <text x="960" y="335" font-family="system-ui,sans-serif" font-size="14" fill="#22c55e" text-anchor="middle">&#8593; $0.20 at Stage 2</text>
  <text x="60" y="580" font-family="system-ui,sans-serif" font-size="18" fill="#475569">www.crossledger.trade</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(svg);
}
