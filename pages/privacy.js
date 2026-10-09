// Privacy notice. Keep it aligned with what the site actually runs: the
// Formspree form (pages/index.js), Google tags (pages/_document.js), the
// clxt_geo cookie (middleware.js), wallet connection (pages/_app.js) and the
// theme preference (components/Layout.js).
import Link from "next/link";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { SITE } from "../lib/site";

const UPDATED = "9 October 2026";

export default function Privacy() {
  return (
    <Layout>
      <Seo
        title="Privacy Notice | CrossLedger"
        description="What personal information crossledger.trade collects, why, who processes it, and how to ask for access, correction or deletion."
        path="/privacy"
        type="article"
      />
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">Privacy</span></nav>
          <h1 className="display" style={{ marginTop: 22, fontSize: "clamp(36px,5vw,56px)" }}>Privacy notice.</h1>
          <p className="lede" style={{ marginTop: 18 }}>This notice explains what crossledger.trade collects, why, and who handles it. Updated {UPDATED}.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container doc-body" style={{ maxWidth: 820 }}>
          <h2 className="h-card">Who we are</h2>
          <p>crossledger.trade is operated by {SITE.entity} (ACN {SITE.acn}), {SITE.address}. Contact us about privacy at <a href={`mailto:${SITE.email}?subject=Privacy`}>{SITE.email}</a>.</p>

          <h2 className="h-card" style={{ marginTop: 32 }}>What we collect and why</h2>
          <ul>
            <li><strong>Enquiry form.</strong> Your first and last name, email address, organisation (optional), enquiry type and message. We use these only to reply to you and to follow up on that enquiry. The form is delivered through Formspree (formspree.io), our form provider, which sends it to our team by email.</li>
            <li><strong>Emails you send us.</strong> Your email address and what you write, used to reply.</li>
            <li><strong>Analytics and advertising measurement.</strong> The site uses Google Analytics and the Google Ads conversion tag. They use cookies to record pages visited, device and browser details and approximate location, so we can see how the site is used and measure our advertising.</li>
            <li><strong>Region check.</strong> Our host, Vercel, tells the site which country your IP address is in. We store only that two-letter country code in a cookie named <code>clxt_geo</code>, for one hour, to decide whether to show the purchase interface. We do not store your IP address.</li>
            <li><strong>Wallet connection.</strong> If you connect a wallet, your public wallet address is read in your browser to show balances and prepare transactions. The connection is handled by Reown (WalletConnect). To read balances and contract data, your browser sends requests, including your wallet address and your IP address, to public Ethereum network providers: dRPC, PublicNode, MEV Blocker and Merkle. We never receive your private keys or seed phrase, and we will never ask for them.</li>
            <li><strong>Blockchain records.</strong> Purchases are Ethereum transactions. They are public and permanent, and neither we nor anyone else can alter or delete them.</li>
            <li><strong>Display preference.</strong> Your light or dark theme choice is saved in your own browser and is not sent to us.</li>
          </ul>

          <h2 className="h-card" style={{ marginTop: 32 }}>Sharing</h2>
          <p>We do not sell personal information. It is shared only with the service providers named above so they can provide their service, or where the law requires it. These providers may store information outside Australia, including in the United States.</p>

          <h2 className="h-card" style={{ marginTop: 32 }}>How long we keep it</h2>
          <p>We keep enquiry emails and form messages for as long as we need them to deal with the enquiry and any resulting business relationship, and as required for our legal and record-keeping obligations.</p>

          <h2 className="h-card" style={{ marginTop: 32 }}>Your choices</h2>
          <ul>
            <li>Email <a href={`mailto:${SITE.email}?subject=Privacy`}>{SITE.email}</a> to ask what we hold about you, or to have it corrected or deleted. We aim to reply within two business days.</li>
            <li>You can block or delete cookies in your browser settings, or opt out of Google Analytics with Google&apos;s <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">browser add-on</a>.</li>
            <li>You can use the site without connecting a wallet or sending an enquiry.</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
