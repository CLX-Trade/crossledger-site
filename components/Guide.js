// Shared layout for the /guides articles: breadcrumb, title, meta line, prose
// body, a pilot-trade call to action and the source list. Each guide page
// passes its own SEO fields, body and sources.
import Link from "next/link";
import Layout from "./Layout";
import Seo from "./Seo";
import { SITE } from "../lib/site";

export default function Guide({ slug, seoTitle, description, title, audience, reviewed, reviewedIso, readTime, sources, children }) {
  const path = `/guides/${slug}`;
  return (
    <Layout>
      <Seo
        title={seoTitle}
        description={description}
        path={path}
        type="article"
        jsonLd={{
          "@context": "https://schema.org", "@type": "Article",
          headline: title, description, datePublished: reviewedIso, dateModified: reviewedIso,
          author: { "@type": "Organization", name: "GDN Group" },
          publisher: { "@type": "Organization", name: "GDN Enterprise Pty Ltd" },
          mainEntityOfPage: `${SITE.url}${path}`,
        }}
      />
      <div className="container">
        <article style={{ maxWidth: 780, margin: "0 auto", padding: "40px 0 96px" }}>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">crossledger.trade</Link><span>/</span><span>Guides</span>
          </nav>
          <h1 className="doc-title">{title}</h1>
          <div className="doc-meta">
            <span>A CrossLedger guide for {audience}</span><span>Last reviewed {reviewed}</span><span>{readTime}</span>
          </div>
          <div className="prose">
            {children}
            <div className="callout">
              <span className="badge-outline">Pilot trades</span>
              <h2 style={{ marginTop: 14 }}>Test it on a real cargo</h2>
              <p>CrossLedger is in development and no commercial trade has settled through it yet. If you trade on our corridors (Australia to Asia, East Africa to Europe, South America to Asia), we are inviting pilot partners now.</p>
              <div className="actions">
                <Link href="/contact" className="btn btn-primary">Discuss a pilot trade</Link>
                <Link href="/how-it-works" className="btn btn-outline">How it works</Link>
              </div>
            </div>
            <h2>Sources</h2>
            <ul>
              {sources.map((s) => (
                <li key={s.url}>{s.label}: <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https:\/\//, "")}</a></li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </Layout>
  );
}
