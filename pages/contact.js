// pages/contact.js — CrossLedger contact page.
//
// /contact was listed in the sitemap and returned 404, because pages/api/contact.js
// existed but no page did. More importantly, every CTA on the site pointed at the
// token, so a business buyer who wanted escrow rather than CLXT had nowhere to land.
//
// Deliberately email-first with NO form. pages/api/contact.js sends via nodemailer
// using SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / CONTACT_TO, and the
// crossledger-site Vercel project currently has NO environment variables set at all,
// so that endpoint would throw on every submission and silently lose enquiries.
// A mailto link cannot fail. If those five variables are ever configured, a form can
// be added back on top of this page.
//
// Platform-only by design: no presale CTA and no price, so this page stays clear of
// the token's regulatory surface.

import Head from "next/head";

const EMAIL = "gnardo@gdngroup.com.au";
const PHONE = "+61 403 707 735";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact CrossLedger — settlement for commodity trade</title>
        <meta
          name="description"
          content="Talk to CrossLedger about smart escrow for cross-border commodity trade: funds release on verified delivery, not on trust."
        />
        <link rel="canonical" href="https://www.crossledger.trade/contact" />
        <meta property="og:title" content="Contact CrossLedger" />
        <meta
          property="og:description"
          content="Escrow that neither side controls, releasing on verified delivery. Enquire about a pilot transaction."
        />
        <meta property="og:url" content="https://www.crossledger.trade/contact" />
      </Head>

      <main className="wrap">
        <header className="top">
          <a className="brand" href="/">
            <span className="mark">C</span>
            <span className="name">
              CrossLedger
              <small>A GDN Group product</small>
            </span>
          </a>
          <a className="back" href="/how-it-works">How it works &rarr;</a>
        </header>

        <section className="hero">
          <p className="eyebrow">Contact</p>
          <h1>Settlement that doesn&rsquo;t ask anyone to move first</h1>
          <p className="lede">
            The buyer wants documents before paying. The seller wants payment before
            shipping. Both are right, and most first-time deals die there.
          </p>
          <p>
            CrossLedger holds the buyer&rsquo;s funds in a smart escrow contract that neither
            party controls &mdash; and that we cannot release either. When the agreed delivery
            documents are satisfied, it pays the seller automatically. The platform fee is
            0.2&ndash;0.4%, against 1&ndash;3% for a documentary letter of credit.
          </p>
        </section>

        <section className="card">
          <h2>Talk to us</h2>
          <p className="card-sub">
            A person reads every message. Usually a reply within one business day.
          </p>
          <a className="primary" href={`mailto:${EMAIL}?subject=CrossLedger%20platform%20enquiry`}>
            {EMAIL}
          </a>
          <a className="secondary" href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
          <p className="hint">
            Useful to include: the commodity, roughly what size a typical parcel is, the
            corridor, and where the deal currently stalls.
          </p>
        </section>

        <section className="candour">
          <h2>Where this actually stands</h2>
          <p>
            No live trade has settled through the platform yet. The contracts are deployed on
            Ethereum mainnet, non-upgradeable and verified, with no administrative mint; the
            independent security audit is in engagement and the report is not yet issued.
          </p>
          <p>
            We are looking for a small number of counterparties to run one sized-down
            transaction alongside their normal process &mdash; platform fee waived, setup
            carried by us, and your existing settlement route left running in parallel.
          </p>
        </section>

        <footer className="foot">
          <span>
            GDN Enterprise Pty Ltd &middot; ACN 666 495 263 &middot; Brisbane, Australia
          </span>
          <span className="note">
            This page concerns settlement software. It is not an offer of, or an invitation
            to acquire, any financial product.
          </span>
        </footer>
      </main>

      <style jsx>{`
        .wrap {
          --navy: #0a1628; --navy-lift: #13284e; --card: rgba(15, 32, 64, 0.86);
          --teal: #00c2d4; --white: #fff; --grey: #7a8fa6; --grey-light: #b8cad8;
          --amber: #f0a93b; --border: rgba(0, 194, 212, 0.18);
          --soft: rgba(184, 202, 216, 0.12);
          max-width: 820px; margin: 0 auto; padding: 0 24px 80px;
          font-family: 'DM Sans', system-ui, sans-serif; color: var(--grey-light);
        }
        .top {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 26px 0 20px; border-bottom: 1px solid var(--border);
        }
        .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--white); }
        .name { font-family: 'Montserrat', system-ui, sans-serif; font-weight: 900;
          font-size: 18px; letter-spacing: -0.4px; line-height: 1.15; }
        .name small { display: block; font-size: 10px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--grey); margin-top: 3px; font-weight: 400; }
        .mark { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--teal), #005fa3);
          box-shadow: 0 0 16px rgba(0, 194, 212, 0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Montserrat', sans-serif; font-weight: 900; color: var(--navy); }
        .back { color: var(--teal); text-decoration: none; font-size: 14px; font-weight: 500; }
        .back:hover { text-decoration: underline; }

        .hero { padding-top: 46px; }
        .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--teal); margin: 0 0 14px; }
        h1 { font-family: 'Montserrat', system-ui, sans-serif; font-weight: 900;
          font-size: clamp(28px, 4.6vw, 40px); line-height: 1.1; letter-spacing: -1px;
          color: var(--white); margin: 0 0 18px; max-width: 18ch; }
        .lede { font-size: 19px; color: var(--white); font-weight: 500; margin: 0 0 16px; }
        .hero p { font-size: 16.5px; line-height: 1.65; margin: 0 0 16px; }

        .card { background: var(--card); border: 1px solid var(--border);
          border-radius: 16px; padding: 30px 28px; margin: 34px 0 0; }
        .card h2 { font-family: 'Montserrat', sans-serif; font-size: 21px; font-weight: 800;
          color: var(--white); margin: 0 0 8px; }
        .card-sub { font-size: 15.5px; color: var(--grey); margin: 0 0 22px; }
        .primary { display: block; text-align: center; padding: 16px 20px; border-radius: 10px;
          background: linear-gradient(135deg, var(--teal), #0099aa); color: var(--navy);
          font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 17px;
          text-decoration: none; word-break: break-all; }
        .primary:hover { transform: translateY(-1px); }
        .secondary { display: block; text-align: center; margin-top: 12px; padding: 14px 20px;
          border: 1px solid var(--border); border-radius: 10px; color: var(--grey-light);
          text-decoration: none; font-size: 16px; }
        .secondary:hover { border-color: var(--teal); color: var(--teal); }
        .hint { font-size: 14.5px; color: var(--grey); margin: 20px 0 0; }

        .candour { background: rgba(240, 169, 59, 0.09);
          border: 1px solid rgba(240, 169, 59, 0.32); border-radius: 14px;
          padding: 24px 26px; margin: 26px 0 0; }
        .candour h2 { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 800;
          color: var(--amber); margin: 0 0 10px; }
        .candour p { font-size: 15.5px; line-height: 1.62; margin: 0 0 12px; }
        .candour p:last-child { margin: 0; }

        .foot { display: flex; flex-direction: column; gap: 10px; margin-top: 50px;
          padding-top: 22px; border-top: 1px solid var(--soft);
          font-size: 13px; color: var(--grey); }
        .note { font-style: italic; }

        a:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; border-radius: 3px; }
      `}</style>

      <style jsx global>{`
        body { background: #0a1628; margin: 0; }
      `}</style>
    </>
  );
}
