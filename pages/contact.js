// Contact page. Email-first on purpose: pages/api/contact.js needs SMTP_* and
// CONTACT_TO environment variables that the Vercel project does not have, so a
// form posting there would lose enquiries. mailto links cannot fail.
// The homepage form posts to Formspree instead, which is configured.
//
// Platform-focused: no price and no presale call to action on this page.
import Link from "next/link";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { SITE } from "../lib/site";

export default function Contact() {
  return (
    <Layout>
      <Seo
        title="Contact CrossLedger | Settlement for Commodity Trade"
        description="Talk to CrossLedger about escrow that releases on verified documents and inspection, pilot trades, inspector and terminal integration, or security disclosures."
        path="/contact"
      />
      <section className="hero">
        <div className="container contact-grid">
          <div>
            <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">Contact</span></nav>
            <h1 className="display" style={{ marginTop: 22, fontSize: "clamp(38px,5vw,60px)" }}>Talk to the team.</h1>
            <p className="lede" style={{ marginTop: 20 }}>A person reads every message, and we aim to reply within two business days. It helps to include the commodity, a typical parcel size, the corridor, and where your deals currently stall.</p>
            <dl className="dl">
              <dt>Email</dt><dd><a href={`mailto:${SITE.email}?subject=CrossLedger%20enquiry`}>{SITE.email}</a></dd>
              <dt>Office</dt><dd>{SITE.address}</dd>
              <dt>Hours</dt><dd>Monday to Friday, 9am to 5pm AEST</dd>
            </dl>
          </div>
          <div className="grid" style={{ alignContent: "start" }}>
            <a className="card card-link" href={`mailto:${SITE.email}?subject=CrossLedger%20pilot%20trade`}><span className="tag">Traders</span><h2 className="h-card">Pilot a trade</h2><p>Buyers and sellers who want payment committed up front and released on proof.</p><span className="more">Email us →</span></a>
            <a className="card card-link" href={`mailto:${SITE.email}?subject=CrossLedger%20inspector%20or%20terminal`}><span className="tag">Inspectors and terminals</span><h2 className="h-card">Sign attestations</h2><p>Surveyors and storage terminals interested in issuing signed results into escrow.</p><span className="more">Email us →</span></a>
            <a className="card card-link" href={`mailto:${SITE.email}?subject=CrossLedger%20security%20disclosure`}><span className="tag warn">Security</span><h2 className="h-card">Report a vulnerability</h2><p>Reproducible issues in the deployed contracts. Please do not disclose publicly before we respond.</p><span className="more">Email us →</span></a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
