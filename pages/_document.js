import { Html, Head, Main, NextScript } from "next/document";
import { SITE } from "../lib/site";

// Per-page title, description, canonical and social tags live in components/Seo.js.
// Keep page-specific tags out of this file: a description here would be
// duplicated on every page next to the page's own.

// Runs before first paint so a saved dark or light choice never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('cl-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

// The Google tag (GA4 and Google Ads) loads only on the production host from
// SITE.url and on the apex, which Vercel redirects there today. next dev,
// Vercel previews and crossledger-site.vercel.app get only the gtag() stub, so
// lib/analytics.js events queue in window.dataLayer and are never sent.
const tagHost = new URL(SITE.url).hostname;
const tagHosts = [tagHost, tagHost.replace(/^www\./, "")];

const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function(){
  if (${JSON.stringify(tagHosts)}.indexOf(location.hostname) === -1) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-S6EMS4TTNP';
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', 'G-S6EMS4TTNP');
  gtag('config', 'AW-18190712729');
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: gaScript }} />
        <meta name="google-site-verification" content="0567f50cc6b6dd62" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111216" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CrossLedger",
              parentOrganization: { "@type": "Organization", name: "GDN Group", url: "https://gdngroup.com.au" },
              url: "https://www.crossledger.trade",
              logo: "https://www.crossledger.trade/apple-touch-icon.png",
              description: "Settlement infrastructure for cross-border commodity trade.",
              sameAs: ["https://x.com/CrossLedgerCLX"],
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
