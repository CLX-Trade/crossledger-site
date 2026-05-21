import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
      <Html lang="en">
            <Head>
                    {/* Primary SEO */}
                            <meta name="description" content="CrossLedger delivers smart escrow and on-chain document verification for cross-border commodity trade. Stage 1 presale live at $0.10/CLXT. Built by GDN Group." />
                                    <meta name="keywords" content="CrossLedger, CLXT, blockchain trade finance, commodity settlement, smart escrow, cross-border trade, presale, Ethereum" />
                                            <meta name="robots" content="index, follow" />
                                                    <link rel="canonical" href="https://www.crossledger.trade" />

                                                            {/* Open Graph */}
                                                                    <meta property="og:title" content="CrossLedger – Institutional-Grade Blockchain Trade Finance" />
                                                                            <meta property="og:description" content="Smart escrow. Verified documents. Fast settlement. Join mid-market exporters and institutional investors in the CLXT Stage 1 presale on Ethereum mainnet." />
                                                                                    <meta property="og:type" content="website" />
                                                                                            <meta property="og:url" content="https://www.crossledger.trade" />
                                                                                                    <meta property="og:image" content="/og-crossledger-presale.png" />
                                                                                                            <meta property="og:site_name" content="CrossLedger" />

                                                                                                                    {/* Twitter Card */}
                                                                                                                            <meta name="twitter:card" content="summary_large_image" />
                                                                                                                                    <meta name="twitter:title" content="CLXT Presale Live | CrossLedger Trade Finance" />
                                                                                                                                            <meta name="twitter:description" content="Blockchain-anchored settlement for commodity exporters. Stage 1 at $0.10/CLXT – price increases at Stage 2." />
                                                                                                                                                    <meta name="twitter:image" content="/og-crossledger-presale.png" />

                                                                                                                                                            {/* Fonts & Icons */}
                                                                                                                                                                    <link rel="icon" href="/favicon.ico" />
                                                                                                                                                                            <link rel="preconnect" href="https://fonts.googleapis.com" />
                                                                                                                                                                                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                                                                                                                                                                                          </Head>
                                                                                                                                                                                                <body>
                                                                                                                                                                                                        <Main />
                                                                                                                                                                                                                <NextScript />
                                                                                                                                                                                                                      </body>
                                                                                                                                                                                                                          </Html>
                                                                                                                                                                                                                            );
                                                                                                                                                                                                                            }