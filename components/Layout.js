import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONTRACTS, SITE } from "../lib/site";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/token", label: "Token facts" },
  { href: "/#security", label: "Security" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function BrandMark({ className = "brand-mark" }) {
  // Two ledgers crossing: the CrossLedger mark, drawn so it survives both themes.
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="clg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3355ff" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#clg)" />
      <path d="M9 10.5h9.5M9 16h14M13.5 21.5H23" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21.5 8.5 10.5 23.5" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("cl-theme", next); } catch {}
    setTheme(next);
  };
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" /></svg>
      )}
    </button>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand" aria-label="CrossLedger home">
            <BrandMark />
            <span>CrossLedger</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={router.pathname === n.href ? "page" : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <Link href="/#presale" className="btn btn-primary btn-buy">Buy CLXT</Link>
            <button type="button" className="icon-btn menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>)}
          <Link href="/#presale" className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>Buy CLXT</Link>
        </nav>
      )}
    </>
  );
}

export function RiskNotice() {
  return (
    <div id="risk" className="risk">
      <div className="container">
        <h4>Risk disclosure and important notice</h4>
        <p><strong>CLXT is a digital token issued by GDN Enterprise Pty Ltd.</strong> Acquiring, holding or transferring CLXT carries material risk, including market, liquidity, regulatory, smart-contract, execution, counterparty and total-loss risk. Statements about future platform features, listings, adoption or prices are plans, not promises.</p>
        <p>GDN Enterprise Pty Ltd does not hold an Australian Financial Services Licence. The classification of CLXT varies by jurisdiction and may change. Nothing on this site is personal financial advice, an offer of securities or an invitation to invest. It is general information that does not consider your objectives, financial situation or needs.</p>
        <p>CLXT is not offered to residents of the jurisdictions listed under <Link href="/#security">Jurisdictional restrictions</Link>. Obtain independent legal, tax and financial advice before taking part, and commit only what you can afford to lose entirely.</p>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand"><BrandMark /><span>CrossLedger</span></Link>
            <p>Settlement infrastructure for cross-border commodity trade: a shared document registry, conditional escrow and inspection-backed release. A GDN Group product.</p>
            <p className="small">{SITE.entity} · ACN {SITE.acn}<br />{SITE.address}</p>
            <a className="partner" href="https://cryptototem.com/" target="_blank" rel="noopener">Listed on <img src="/cryptototem-logo.png" alt="CryptoTotem" /></a>
          </div>
          <div>
            <h5>Learn</h5>
            <ul>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/whitepaper">Whitepaper</Link></li>
              <li><a href="/CrossLedger-CLXT-Whitepaper.pdf" target="_blank" rel="noopener">Whitepaper (PDF)</a></li>
              <li><Link href="/#faq">FAQ</Link></li>
              <li><Link href="/#risk">Risk disclosure</Link></li>
            </ul>
          </div>
          <div>
            <h5>On-chain</h5>
            <ul>
              <li><Link href="/token">Token facts and locks</Link></li>
              <li><a href={`https://etherscan.io/token/${CONTRACTS.clxt}`} target="_blank" rel="noopener">CLXT token ↗</a></li>
              <li><a href={`https://etherscan.io/address/${CONTRACTS.presale}`} target="_blank" rel="noopener">Presale contract ↗</a></li>
              <li><a href={`https://etherscan.io/token/${CONTRACTS.usdt}`} target="_blank" rel="noopener">USDT (payment) ↗</a></li>
              <li><Link href="/#security">Security status</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="https://gdngroup.com.au" target="_blank" rel="noopener">GDN Group ↗</a></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><a href="https://x.com/CrossLedgerCLX" target="_blank" rel="noopener">X / @CrossLedgerCLX ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <div>© {new Date().getFullYear()} {SITE.entity}. CrossLedger and CLXT are products of GDN Group.</div>
          <div>Brisbane · Dubai · Orlando · São Paulo</div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <RiskNotice />
      <SiteFooter />
    </>
  );
}
