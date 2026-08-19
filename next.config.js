// Security headers. Deliberately no Content-Security-Policy: this page loads
// wallet SDKs (Reown/WalletConnect), styled-jsx inline styles and several RPC
// origins, so a strict CSP needs testing against a real wallet connection
// rather than being added blind. The headers below carry no such risk.
const securityHeaders = [
  // Stop the site being framed by a third party. Matters here because the page
  // triggers wallet approvals: an attacker who can iframe it can overlay their
  // own UI and trick a visitor into signing a transaction they cannot see.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Browsers must respect the declared Content-Type instead of guessing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Do not leak the full URL (including any query) to third-party origins.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No page on this site needs these devices.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
]

module.exports = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  }
}
