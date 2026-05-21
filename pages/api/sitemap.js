export default function handler(req, res) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
              <url>
                  <loc>https://www.crossledger.trade/</loc>
                      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
                          <changefreq>daily</changefreq>
                              <priority>1.0</priority>
                                  <image:image>
                                        <image:loc>https://www.crossledger.trade/og-image.png</image:loc>
                                              <image:title>CrossLedger (CLXT) — Blockchain Settlement for Global Commodity Trade</image:title>
                                                  </image:image>
                                                    </url>
                                                      <url>
                                                          <loc>https://www.crossledger.trade/contact</loc>
                                                              <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
                                                                  <changefreq>monthly</changefreq>
                                                                      <priority>0.5</priority>
                                                                        </url>
                                                                        </urlset>`;

                                                                          res.setHeader('Content-Type', 'application/xml');
                                                                            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
                                                                              res.write(sitemap);
                                                                                res.end();
                                                                                }